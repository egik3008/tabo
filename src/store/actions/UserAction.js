import firebase from 'firebase';
import axios from 'axios';
import history from '../../services/history';
import {
  database,
  facebookAuthProvider,
  googleAuthProvider
} from '../../services/firebase';
import {
  fetchPhotographerServiceInformation,
  tellThemThatWasSuccessOrFailed
} from "./photographerServiceInfoActions";
import { USER_PHOTOGRAPHER } from '../../services/userTypes';

const initialiazePhotographerProfileData = uid => {
  const db = database.database();

  db
    .ref('photographer_service_information')
    .child(uid)
    .once('value')
    .then((snapshot) => {
      const vals = snapshot.val();
      if (vals === null) {
        const initialProfileData = {
          serviceReviews: {
            rating: {
              label: 'Rating',
              value: 3
            },
            impressions: [
              { label: 'Friendly', value: 0.5 },
              { label: 'Skillful', value: 0.5 },
              { label: 'Creative', value: 0.5 }
            ]
          }
        };

        db
          .ref('photographer_service_information')
          .child(uid)
          .set(initialProfileData)
          .catch((error) => {
            console.log(error);
          })
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

const createUserMetadata = async (accountProvider, uid, email, userType, displayName) => {
  try {
    const db = database.database();
    const child = db.ref('user_metadata').child(uid);
    const result_data = await child.once('value');
    const data = await result_data.val();

    if (data === null) {
      let metaData = {
        uid,
        email,
        userType,
        firstLogin: true,
        displayName,
        phoneNumber: '-',
        created: firebase.database.ServerValue.TIMESTAMP,
        enable: 1
      };

      if (userType === USER_PHOTOGRAPHER) {
        metaData.rating = 3;
        metaData.priceStartFrom = 0;
        metaData.defaultDisplayPictureUrl = '-';
        metaData.photoProfilePublicId = '-';
        metaData.defaultDisplayPicturePublicId = '-';
      }

      await child.set(metaData);
      notifyToSlack(`New user registered via ${accountProvider} - Name: ${displayName}, Email: ${email}, Type: ${userType}`);
      return true;
    }
  } catch (error) {
    return new Error('Failed to create user metadata, ' + error.message);
  }
};

const notifyToSlack = (text) => {
  const fixText = `[${process.env.REACT_APP_MY_NODE_ENV}] ${text}`;
  axios
    .post(`${process.env.REACT_APP_API_HOSTNAME}/api/slack-integration/notify-userbase-status`, { text: fixText })
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
};

export const userSignupByEmailPassword = (
  email,
  password,
  displayName,
  userType
) => {
  return dispatch => {
    database
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(function(result) {

        // Here we send email the email verification
        axios
          .post(process.env.REACT_APP_API_HOSTNAME + '/api/email-service/email-verification', {
            receiverEmail: email,
            receiverName: displayName,
            uid: result.uid
          })
          .then((response) => {
            console.log(response.data);
          })
          .catch((error) => {
            console.log(error);
          });

        createUserMetadata('Email', result.uid, email, userType, displayName)
          .then(() => {
            if (userType === USER_PHOTOGRAPHER) {
              initialiazePhotographerProfileData(result.uid);
            }
            // Logout Implicitly
            database.auth()
              .signOut()
              .catch(error => {
                console.log(error);
              });
            // End Logout
          })
          .catch((error) => {
            console.log(error);
          });

        dispatch({
          type: 'USER_SIGNUP_SUCCESS',
          payload: { status: 'OK', message: 'User created', uid: result.uid },
        });

        return true;
      })
      .then(() => {
        history.push('/photographer-registration/s1-checkmail');
      })
      .catch(function(error) {
        console.log(error);
        dispatch({
          type: 'USER_SIGNUP_ERROR',
          payload: { ...error, completeName: displayName, email, password },
        });
      });
  };
};

export const userSignupByFacebook = userType => {
  return dispatch => {
    dispatch({ type: 'USER_AUTH_LOGIN_START' });
    facebookAuthProvider.addScope('public_profile,email');
    database
      .auth()
      .signInWithPopup(facebookAuthProvider)
      .then(result => {
        const email = result.additionalUserInfo.profile.email;
        const displayName = result.additionalUserInfo.profile.name;

        createUserMetadata('Facebook', result.user.uid, email, userType, displayName)
          .then(() => {
            if (userType === USER_PHOTOGRAPHER) {
              initialiazePhotographerProfileData(result.user.uid);
            }
            return true;
          })
          .then(() => {
            const payload = {
              uid: result.user.uid,
              email: result.user.providerData[0].email,
              emailVerified: result.user.emailVerified,
              displayName,
              photoURL: result.user.photoURL,
              refreshToken: result.user.refreshToken
            };

            dispatch({ type: 'USER_AUTH_LOGIN_SUCCESS', payload });
            return true;

          })
          .then(() => {
            fetchUserMetadata(result.user.uid, dispatch)
              .then((data) => {
                if (data.userType === USER_PHOTOGRAPHER && data.firstLogin) {
                  history.push('/photographer-registration/s2');
                } else {
                  history.push('/');
                }
              })
              .catch((error) => {
                console.log(error);
              });

          })
          .catch(error => {
            console.log(error);
          });
      })
      .catch(error => {
        console.log(error);
        dispatch({
          type: 'USER_AUTH_LOGIN_ERROR',
          payload: error,
        });
      });
  };
};

export const userSignupByGoogle = userType => {
  return dispatch => {
    dispatch({ type: 'USER_AUTH_LOGIN_START' });
    googleAuthProvider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    database
      .auth()
      .signInWithPopup(googleAuthProvider)
      .then(result => {
        const uid = result.user.uid;
        const email = result.user.email;
        const displayName = result.user.displayName;

        createUserMetadata('Google', uid, email, userType, displayName)
          .then(() => {
            if (userType === USER_PHOTOGRAPHER) {
              initialiazePhotographerProfileData(uid);
            }
            return true;

          })
          .then(() => {
            const payload = {
              uid,
              email: email,
              emailVerified: true,
              displayName,
              photoURL: result.user.photoURL,
              refreshToken: result.user.refreshToken
            };

            dispatch({ type: 'USER_AUTH_LOGIN_SUCCESS', payload });
            return true;

          })
          .then(() => {
            fetchUserMetadata(uid, dispatch)
              .then((data) => {
                if (data.userType === USER_PHOTOGRAPHER && data.firstLogin) {
                  history.push('/photographer-registration/s2');
                } else {
                  history.push('/');
                }
              })
              .catch((error) => {
                console.log(error);
              });

          })
          .catch(error => {
            console.log(error);
          });

      })
      .catch(error => {
        console.log(error);
        dispatch({
          type: 'USER_AUTH_LOGIN_ERROR',
          payload: error,
        });
      });
  };
};

const fetchUserMetadata = async (uid, dispatch) => {
  const child = database.database().ref('user_metadata').child(uid);
  const retrieveResult = await child.once('value');
  const data = await retrieveResult.val();

  dispatch({
    type: 'USER_AUTH_LOGIN_SUCCESS_FETCH_USER_METADATA',
    payload: data,
  });

  return data;
};

export const loggingIn = (email, password) => {
  return dispatch => {
    dispatch({
      type: 'USER_AUTH_LOGIN_START',
      payload: { loggingIn: true },
    });

    // Checking wether the email is registered as google or facebook
    axios
      .get(`${process.env.REACT_APP_API_HOSTNAME}/api/auth/accountType/?email=${email}`)
      .then((response) => {
        const providers = response.data.data.map((item) => item.providerId);

        if (providers.includes('password')) {
          const firebaseAuth = database.auth();
          firebaseAuth
            .signInWithEmailAndPassword(email, password)
            .then(() => {
              firebaseAuth.onAuthStateChanged(user => {
                if (user) {
                  const payload = {
                    uid: user.uid,
                    email: user.email,
                    emailVerified: user.emailVerified,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    refreshToken: user.refreshToken
                  };

                  if (!user.emailVerified) {
                    dispatch({
                      type: 'USER_AUTH_LOGIN_ERROR',
                      payload: { message: 'User not verified.' },
                    });

                  } else {
                    dispatch({ type: 'USER_AUTH_LOGIN_SUCCESS', payload });

                    fetchUserMetadata(user.uid, dispatch)
                      .then((data) => {
                        if (data.userType === USER_PHOTOGRAPHER && data.firstLogin) {
                          history.push('/photographer-registration/s2');
                        } else {
                          history.push('/');
                        }
                      });
                  }
                }
              });

            })
            .catch(error => {
              dispatch({
                type: 'USER_AUTH_LOGIN_ERROR',
                payload: error,
              });
            });

        } else {
          const provider = response.data.data[0].providerId;
          const mapInfo = {
            "google.com": "Google",
            "facebook.com": "Facebook"
          };
          const message = `Your account is registered using ${mapInfo[provider]}. Then you must click "Login with ${mapInfo[provider]}" button.`;

          dispatch({
            type: 'USER_AUTH_LOGIN_ERROR',
            payload: { message }
          });
        }

      })
      .catch((error) => {
        dispatch({
          type: 'USER_AUTH_LOGIN_ERROR',
          payload: { message: error.response.data.message },
        });
      });
  };
};

export const loggingOut = () => {
  return dispatch => {
    const firebaseAuth = database.auth();
    firebaseAuth
      .signOut()
      .then(() => {
        dispatch({ type: 'USER_AUTH_LOGOUT_SUCCESS' });
        history.push('/');
        window.location.reload(true);
      })
      .catch(error => {
        console.log(error);
        dispatch({ type: 'USER_AUTH_LOGOUT_ERROR' });
        history.push('/');
        window.location.reload(true);
      });
  };
};

export const searchInformationLog = (location, datetime) => {
  return dispatch => {
    dispatch({
      type: 'SEARCH_INFORMATION_SUBMIT_SEARCH_LOG',
      payload: { location, datetime }
    });
  };
};

export const updatePhotographerServiceInfoPhotosPortofolio = (uid, data, isInitiation = true) => {
  if (data) {
    const db = database.database();

    if (isInitiation) {
      // Update defaultDisplayPictureUrl in user metadata
      db
        .ref('user_metadata')
        .child(uid)
        .update({
          defaultDisplayPictureUrl: data[0].url,
          defaultDisplayPicturePublicId: data[0].publicId,
          updated: firebase.database.ServerValue.TIMESTAMP
        })
        .then(() => {

          // Update photos portofolio in photographer service information
          const photos = data.map((item, index) => index === 0
            ? { ...item, defaultPicture: true }
            : { ...item, defaultPicture: false });

          db
            .ref('photographer_service_information')
            .child(uid)
            .update({
              photosPortofolio: photos,
              updated: firebase.database.ServerValue.TIMESTAMP
            });
        });

    } else {
      db
        .ref('photographer_service_information')
        .child(uid)
        .update({
          photosPortofolio: data,
          updated: firebase.database.ServerValue.TIMESTAMP
        });
    }
  }
};

export const updateUserMetadataDefaultDisplayPicture = (reference, pictureUrl, picturePublicId) => {
  const db = database.database();
  const ref = db.ref('/user_metadata');
  const userRef = ref.child(reference);

  userRef.update({
    defaultDisplayPictureUrl: pictureUrl,
    defaultDisplayPicturePublicId: picturePublicId,
    updated: firebase.database.ServerValue.TIMESTAMP
  });
};

export const deletePortfolioPhotos = (uid, photosDeleted, imagesExisting) => {
  return (dispatch) => {
    if (photosDeleted.length > 0) {
      dispatch({ type: 'PROFILE_MANAGER_DELETE_PHOTOS_PORTFOLIO_START' });
      const publicIdList = photosDeleted.map((item) => item.publicId);

      axios({
        method: 'DELETE',
        url: `${process.env.REACT_APP_API_HOSTNAME}/api/cloudinary-images/delete`,
        params: {
          public_ids: publicIdList
        }
      })
        .then((response) => {
          database
            .database()
            .ref('photographer_service_information')
            .child(uid)
            .update({ photosPortofolio: imagesExisting });

          dispatch({ type: 'PROFILE_MANAGER_DELETE_PHOTOS_PORTFOLIO_SUCCESS' });
        })
        .then(() => {
          dispatch(fetchPhotographerServiceInformation(uid));
          dispatch(tellThemThatWasSuccessOrFailed('success'));
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };
};
