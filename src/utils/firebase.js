import { initializeApp } from 'firebase/app';
// const { initializeAppCheck, ReCaptchaV3Provider } = require("firebase/app-check");

import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  getDocs,
  getDoc,
  doc,
  enableNetwork,
  CACHE_SIZE_UNLIMITED,
  setLogLevel,
  initializeFirestore,
} from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { firebaseConfig } from '../../firebase_config';
import {
  getAuth,
  initializeAuth,
  signInWithEmailAndPassword,
  browserLocalPersistence,
  inMemoryPersistence,
  setPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
const app = initializeApp(firebaseConfig);
// const appCheck = initializeAppCheck(app, {
//     provider: new ReCaptchaV3Provider('abcdefghijklmnopqrstuvwxy-1234567890abcd'),

//     // Optional argument. If true, the SDK automatically refreshes App Check
//     // tokens as needed.
//     isTokenAutoRefreshEnabled: true
//   });

const Auth = initializeAuth(app, { persistence: inMemoryPersistence });
const dbInit = getFirestore(app);

// const copied = { ...db2 }
// console.log(copied)
//  for (let i = 0; i < keys.length; i++) {
//    const key = keys[i] // 각각의 키
//    const value = db[key] // 각각의 키에 해당하는 각각의 값
// }
dbInit._settings.experimentalAutoDetectLongPolling = true;
dbInit._settings.experimentalForceLongPolling = true;
// const settings1 = {
//     cacheSizeBytes: CACHE_SIZE_UNLIMITED,
//     experimentalForceLongPolling: true,
//     experimentalAutoDetectLongPolling: true,
// };
// const settings = {
//     cacheSizeBytes: CACHE_SIZE_UNLIMITED,
//     experimentalForceLongPolling: true,
//     experimentalAutoDetectLongPolling: true,
// };
// const db2 = initializeFirestore(app, settings);
// db.settting(settings1)

export const DB = getFirestore(app);
console.log(DB);

// setLogLevel('debug')
export const login = async ({ email, password }) => {
  const auth = getAuth(app);
  return setPersistence(auth, inMemoryPersistence)
    .then(async () => {
      // Existing and future Auth states are now persisted in the current
      // session only. Closing the window would clear any existing state even
      // if a user forgets to sign out.
      // ...
      // New sign-in will be persisted with session persistence.
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      return user;
    })
    .catch(error => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
    });

  // const { user } = await signInWithEmailAndPassword(Auth, email, password)
  // return user;
};

export const signup = async ({ email, password, name, photoUrl }) => {
  const { user } = await createUserWithEmailAndPassword(Auth, email, password);
  const storageUrl = photoUrl.startsWith('https') ? photoUrl : await uploadImage(photoUrl);
  const auth = getAuth();
  await updateProfile(auth.currentUser, {
    displayName: name,
    photoURL: storageUrl,
  });
  return user;
};
// https://github.com/firebase/codelab-friendlychat-web/blob/main/web/src/index.js
const uploadImage = async uri => {
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };

    xhr.onerror = function (e) {
      reject(new TypeError('network request failed'));
    };

    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });

  const auth = getAuth();
  // const ref = app.storage().ref(`/profile/${auth.currentUser.uid}/photo.png`);
  // const snapshot = await ref.put(blob, { contentType: 'image/png' });

  // 2 - Upload the image to Cloud Storage.
  const filePath = `/profile/${auth.currentUser.uid}/photo.png`;
  const newImageRef = ref(getStorage(), filePath);
  const snapshot = await uploadBytesResumable(newImageRef, blob, { contentType: 'image/png' });
  // const snapshot = await uploadBytesResumable(newImageRef, file);
  // const snapshot = await newImageRef.put(blob, { contentType: 'image/png' });

  blob.close();
  return await getDownloadURL(newImageRef);
};

export const logout = async () => {
  const auth = getAuth();
  return await auth.logout();
};

export const getCurrentUser = () => {
  const auth = getAuth(app);
  const { uid, displayName, email, photoURL } = auth.currentUser;
  console.log(auth.currentUser);
  return { uid, name: displayName, email, photoUrl: photoURL };
};

export const updateUserPhoto = async photoUrl => {
  const auth = getAuth();
  const user = auth.currentUser;
  const storageUrl = photoUrl.startsWith('https') ? photoUrl : await uploadImage(photoUrl);

  await updateProfile(auth.currentUser, { photoURL: storageUrl });
  return { name: user.displayName, email: user.email, photoUrl: user.photoURL };
};

export const createChannel = async ({ title, description }) => {
  const auth = getAuth(app);

  const citiesCol = await collection(DB, 'channels');
  // 1. 조회
  const citySnapshot = await getDocs(citiesCol);
  console.log('Document written with ID: ', citySnapshot.id);
  const cityList = citySnapshot.docs.map(doc => doc.data());
  console.log(cityList);

  // const newChannelRef = collection(db, 'channels');
  // // console.log(newChannelRef)
  // // const id = newChannelRef.id;
  // // console.log(newChannelRef)
  // const newChannel = {
  //     first: "test",
  //     last: "test",
  //     born: 1111
  // };
  // await newChannelRef.set(newChannel);
  // return id;
  // const newChannelRef = await addDoc(collection(DB, "channels"), {
  //     title:title,
  //     description:description
  // });
  try {
    const docRef = await addDoc(citiesCol, {
      title,
      description,
      createAt: Date.now(),
    });
    console.log('Document written with ID: ', docRef.id);
    return docRef.id;
  } catch (e) {
    console.error('Error adding document: ', e);
  }
  return 0;
};

export const createMessage = async ({ channelId, message }) => {
  // const msgCollection = await collection(DB, 'channels/' + channelId + '/messages');

  // // const docRef = doc(DB, 'channels/' + channelId + '/messages' + message._id);
  // try {
  //     const docRef =  await addDoc(msgCollection, {
  //         ...message,
  //         createAt: Date.now()
  //     });
  //     console.log("Document written with ID: ", docRef.id);
  //     return docRef;
  // } catch (e) {
  //     console.error("Error adding document: ", e);
  // }
  console.log('----------------------------------------------------s', message._id);
  const citiesRef = doc(DB, 'channels/' + channelId + '/messages/' + message._id);
  // const docSnap = await getDoc(citiesRef);
  // console.log(docSnap)
  try {
    await setDoc(citiesRef, {
      ...message,
      createAt: Date.now(),
    });
    // console.log("Document written with ID: ", docRef.id);
    // return docRef;
  } catch (e) {
    console.error('Error adding document: ', e);
  }
  return 0;
};
