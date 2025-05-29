// Firebase config (already set up)
const firebaseConfig = {
  apiKey: "AIzaSyDK7S_Vi9JZrUq8SIRZG7e_yeuCX5RX7Lg",
  authDomain: "socialsite-project.firebaseapp.com",
  projectId: "socialsite-project",
  storageBucket: "socialsite-project.firebasestorage.app",
  messagingSenderId: "470566554445",
  appId: "1:470566554445:web:755f791512ab2b4c250504"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM
const signupBtn = document.getElementById('signup-btn');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const postBtn = document.getElementById('post-btn');
const postsDiv = document.getElementById('posts');
const userInfo = document.getElementById('user-info');
const nav = document.getElementById('nav');

const profileSection = document.getElementById('profile-section');
const feedSection = document.getElementById('feed-section');
const postSection = document.getElementById('post-section');
const myPostsDiv = document.getElementById('my-posts');
const saveProfileBtn = document.getElementById('save-profile-btn');

// Auth
signupBtn.onclick = () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  auth.createUserWithEmailAndPassword(email, password)
    .catch(err => alert(err.message));
};

loginBtn.onclick = () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  auth.signInWithEmailAndPassword(email, password)
    .catch(err => alert(err.message));
};

logoutBtn.onclick = () => auth.signOut();

auth.onAuthStateChanged(user => {
  if (user) {
    userInfo.textContent = `Logged in as: ${user.email}`;
    nav.style.display = "block";
    logoutBtn.style.display = "inline-block";
    loginBtn.style.display = signupBtn.style.display = "none";
    showSection('feed-section');
    loadPosts();
    loadMyPosts();
    loadProfile();
  } else {
    userInfo.textContent = "";
    nav.style.display = "none";
    logoutBtn.style.display = "none";
    loginBtn.style.display = signupBtn.style.display = "inline-block";
    postsDiv.innerHTML = "";
  }
});

// Navigation handler
function showSection(id) {
  [postSection, feedSection, profileSection].forEach(sec => sec.style.display = "none");
  document.getElementById(id).style.display = "block";
}

// Post message
postBtn.onclick = () => {
  const text = document.getElementById('post-text').value.trim();
  const user = auth.currentUser;
  if (text && user) {
    db.collection('posts').add({
      text,
      user: user.email,
      uid: user.uid,
      created: firebase.firestore.FieldValue.serverTimestamp()
    });
    document.getElementById('post-text').value = "";
  } else {
    alert("You need to be logged in and write something!");
  }
};

// Load feed
function loadPosts() {
  db.collection('posts').orderBy('created', 'desc').onSnapshot(snapshot => {
    postsDiv.innerHTML = "";
    snapshot.forEach(doc => {
      const post = doc.data();
      const time = post.created?.toDate().toLocaleString() || "";
      postsDiv.innerHTML += `
        <div class="post">
          <div class="post-user">${post.user}</div>
          <div>${post.text}</div>
          <div class="post-time">${time}</div>
        </div>
      `;
    });
  });
}

// Load user's own posts
function loadMyPosts() {
  const user = auth.currentUser;
  if (!user) return;
  db.collection('posts').where('uid', '==', user.uid).orderBy('created', 'desc').onSnapshot(snapshot => {
    myPostsDiv.innerHTML = "";
    snapshot.forEach(doc => {
      const post = doc.data();
      const time = post.created?.toDate().toLocaleString() || "";
      myPostsDiv.innerHTML += `
        <div class="post">
          <div class="post-user">You</div>
          <div>${post.text}</div>
          <div class="post-time">${time}</div>
        </div>
      `;
    });
  });
}

// Save profile info
saveProfileBtn.onclick = () => {
  const user = auth.currentUser;
  if (!user) return;
  const displayName = document.getElementById('display-name').value;
  const bio = document.getElementById('bio').value;
  db.collection('profiles').doc(user.uid).set({ displayName, bio });
};

// Load profile info
function loadProfile() {
  const user = auth.currentUser;
  if (!user) return;
  db.collection('profiles').doc(user.uid).get().then(doc => {
    if (doc.exists) {
      const data = doc.data();
      document.getElementById('display-name').value = data.displayName || "";
      document.getElementById('bio').value = data.bio || "";
    }
  });
}
