import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
	apiKey: "AIzaSyDba17ybV3s_h6gcZSP1-9nGgaALc1_2Pk",
	authDomain: "lifelog-f2904.firebaseapp.com",
	projectId: "lifelog-f2904",
	storageBucket: "lifelog-f2904.appspot.com",
	messagingSenderId: "341732508688",
	appId: "1:341732508688:android:4063fe724164fa1c18f695",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
