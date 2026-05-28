// 1. Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const useFallback = (firebaseConfig.apiKey === "YOUR_API_KEY");

// Improved ID Generator
const generateId = () => {
    return 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
};

const getLocalPosts = () => {
    const posts = localStorage.getItem('school_posts_v2');
    if (!posts) {
        return [
            { id: "sample-1", author: "운영자", email: "admin@school.ac.kr", content: "로봇소프트웨어과 커뮤니티에 오신 것을 환영합니다! 공지사항을 확인해주세요.", views: 156, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
            { id: "sample-2", author: "김철수", email: "chulsoo@naver.com", content: "이번 로봇 경진대회 같이 준비하실 팀원 구합니다! 학번 상관없어요.", views: 64, createdAt: new Date(Date.now() - 86400000).toISOString() },
            { id: "sample-3", author: "이영희", email: "younghee@daum.net", content: "ROS 기초 강의 자료실에 업로드했습니다. 공부하실 분들 참고하세요~", views: 89, createdAt: new Date(Date.now() - 72000000).toISOString() },
            { id: "sample-4", author: "박지성", email: "js_park@gmail.com", content: "인공지능 소프트웨어 실습실 사용 가능한 시간 아시는 분?", views: 42, createdAt: new Date(Date.now() - 36000000).toISOString() },
            { id: "sample-5", author: "최유진", email: "yujin_c@kakao.com", content: "취업 준비하시는 선배님들, 포트폴리오 구성 어떻게 하셨나요?", views: 110, createdAt: new Date(Date.now() - 18000000).toISOString() },
            { id: "sample-6", author: "정민호", email: "minho@naver.com", content: "전공동아리 'Robo-Master' 신입 부원 모집이 이번 주 금요일까지입니다!", views: 75, createdAt: new Date(Date.now() - 7200000).toISOString() },
            { id: "sample-7", author: "강하늘", email: "sky_kang@school.ac.kr", content: "학과 도서관에 파이썬 관련 신권이 많이 들어왔네요. 다들 빌려 가세요.", views: 32, createdAt: new Date(Date.now() - 3600000).toISOString() },
            { id: "sample-8", author: "한수민", email: "sumin_h@gmail.com", content: "졸업 프로젝트 주제 선정 때문에 고민인데, 주제 추천 좀 해주세요!", views: 52, createdAt: new Date(Date.now() - 1800000).toISOString() },
            { id: "sample-9", author: "윤태양", email: "sun_yoon@naver.com", content: "대기업 IT 인턴십 합격 후기 공유합니다. 궁금한 점 댓글 달아주세요.", views: 420, createdAt: new Date(Date.now() - 900000).toISOString() },
            { id: "sample-10", author: "학생회", email: "union@school.ac.kr", content: "다음 주 학과 연합 MT 관련 수요 조사 중입니다. 학과 단톡방 확인 부탁드립니다!", views: 231, createdAt: new Date(Date.now()).toISOString() }
        ];
    }
    return JSON.parse(posts);
};

const saveLocalPost = (author, email, content, password, id = null) => {
    let posts = getLocalPosts();
    if (id) {
        // Update existsing
        posts = posts.map(p => p.id === id ? { ...p, author, email, content } : p);
    } else {
        // Create new
        posts.unshift({ 
            id: generateId(), 
            author, email, content, password,
            views: 1, 
            createdAt: new Date().toISOString() 
        });
    }
    localStorage.setItem('school_posts_v2', JSON.stringify(posts));
};

const deleteLocalPost = (id) => {
    if (!id) return;
    let posts = getLocalPosts();
    // Strict filter to ensure only the matching ID is removed
    posts = posts.filter(p => p.id !== id);
    localStorage.setItem('school_posts_v2', JSON.stringify(posts));
};

// --- Core Logic ---

document.addEventListener('DOMContentLoaded', () => {
    // View Switching Logic
    const viewTriggers = document.querySelectorAll('.view-trigger');
    const contentViews = document.querySelectorAll('.content-view');

    viewTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const targetViewId = `view-${trigger.getAttribute('data-view')}`;
            
            // Update Active Trigger
            viewTriggers.forEach(t => t.classList.remove('active'));
            trigger.classList.add('active');

            // Update Active View
            contentViews.forEach(view => {
                view.classList.remove('active');
                if (view.id === targetViewId) {
                    view.classList.add('active');
                    window.scrollTo(0, 0); // Scroll to top when switching views
                }
            });
        });
    });
    const boardList = document.getElementById('board-list');
    const postForm = document.getElementById('post-form');
    const boardSearch = document.getElementById('board-search');
    const btnPopularPosts = document.getElementById('btn-popular-posts');
    const boardTitle = document.querySelector('.section-title-wrapper-centered h2');
    const modal = document.getElementById('modal-post-form');
    const modalTitle = modal ? modal.querySelector('h3') : null;
    const submitBtn = postForm ? postForm.querySelector('button[type="submit"]') : null;
    
    let allPosts = [];
    let currentView = 'all';
    let editingId = null;

    const openModal = (post = null) => {
        if (post) {
            editingId = post.id;
            modalTitle.innerText = "게시글 수정하기";
            submitBtn.innerText = "수정 완료";
            document.getElementById('post-author').value = post.author;
            document.getElementById('post-email').value = post.email || '';
            document.getElementById('post-content').value = post.content;
        } else {
            editingId = null;
            modalTitle.innerText = "새 글 쓰기";
            submitBtn.innerText = "게시글 등록";
            postForm.reset();
        }
        modal.style.display = "block";
    };

    const renderPosts = (posts) => {
        if (!boardList) return;
        boardList.innerHTML = "";
        
        let filteredPosts = [...posts];
        if (currentView === 'popular') {
            filteredPosts.sort((a, b) => (b.views || 0) - (a.views || 0));
        } else {
            filteredPosts.sort((a, b) => {
                const parseDate = (d) => {
                    if (!d) return new Date(0);
                    if (d.toDate) return d.toDate();
                    const date = new Date(d);
                    return isNaN(date.getTime()) ? new Date(0) : date;
                };
                return parseDate(b.createdAt) - parseDate(a.createdAt);
            });
        }

        if (filteredPosts.length === 0) {
            boardList.innerHTML = '<p class="loading">게시글이 없습니다. 첫 번째 글을 남겨보세요!</p>';
            return;
        }

        filteredPosts.forEach((post) => {
            const postEl = document.createElement('div');
            postEl.className = 'post-item slide-up-section is-visible';
            
            let dateStr = '방금 전';
            try {
                const date = post.createdAt?.toDate ? post.createdAt.toDate() : new Date(post.createdAt);
                dateStr = date.toLocaleDateString();
            } catch(e) {}

            postEl.innerHTML = `
                <div class="post-actions">
                    <button class="action-btn edit" title="수정">✎</button>
                    <button class="action-btn delete" title="삭제">×</button>
                </div>
                <h4>${post.author}님의 글</h4>
                <p>${post.content}</p>
                <small>${post.author} | ${dateStr} | 조회수: ${post.views || 0}</small>
            `;
            
            // Edit Event
            postEl.querySelector('.edit').onclick = () => {
                if (post.password) {
                    const pwd = prompt("게시물을 수정하려면 비밀번호를 입력하세요:");
                    if (pwd === null) return;
                    if (pwd !== post.password) {
                        alert("비밀번호가 일치하지 않습니다.");
                        return;
                    }
                }
                openModal(post);
            };

            // Delete Event
            postEl.querySelector('.delete').onclick = () => {
                if (post.password) {
                    const pwd = prompt("게시물을 삭제하려면 비밀번호를 입력하세요:");
                    if (pwd === null) return;
                    if (pwd !== post.password) {
                        alert("비밀번호가 일치하지 않습니다.");
                        return;
                    }
                }

                if(confirm("정말 이 게시글을 삭제하시겠습니까?")) {
                    console.log("Deleting post with ID:", post.id);
                    if (!useFallback && typeof firebase !== 'undefined') {
                        firebase.firestore().collection("posts").doc(post.id).delete();
                    } else {
                        deleteLocalPost(post.id);
                        allPosts = getLocalPosts();
                        renderPosts(allPosts);
                    }
                }
            };

            boardList.appendChild(postEl);
        });
    };

    // Initialize Database
    if (!useFallback && typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();

        postForm.onsubmit = (e) => {
            e.preventDefault();
            const author = document.getElementById('post-author').value;
            const email = document.getElementById('post-email').value;
            const passwordElement = document.getElementById('post-password');
            const password = passwordElement ? passwordElement.value : '';
            const content = document.getElementById('post-content').value;

            if (editingId) {
                db.collection("posts").doc(editingId).update({ author, email, content })
                  .then(() => closeModal());
            } else {
                db.collection("posts").add({
                    author, email, content, password, views: 1,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => closeModal());
            }
        };

        db.collection("posts").orderBy("createdAt", "desc").onSnapshot((snapshot) => {
            allPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderPosts(allPosts);
        });
    } else {
        allPosts = getLocalPosts();
        renderPosts(allPosts);

        postForm.onsubmit = (e) => {
            e.preventDefault();
            const author = document.getElementById('post-author').value;
            const email = document.getElementById('post-email').value;
            const passwordElement = document.getElementById('post-password');
            const password = passwordElement ? passwordElement.value : '';
            const content = document.getElementById('post-content').value;

            saveLocalPost(author, email, content, password, editingId);
            closeModal();
            allPosts = getLocalPosts();
            renderPosts(allPosts);
            if (!editingId) boardList.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };
    }

    const closeModal = () => {
        modal.style.display = "none";
        postForm.reset();
        editingId = null;
    };

    // UI Events Safely
    const btnShowForm = document.getElementById('btn-show-form');
    if (btnShowForm) btnShowForm.onclick = () => openModal();

    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) closeBtn.onclick = closeModal;

    const btnCancelForm = document.getElementById('btn-cancel-form');
    if (btnCancelForm) btnCancelForm.onclick = closeModal;

    window.onclick = (e) => { if (e.target == modal) closeModal(); };

    if (btnPopularPosts) {
        btnPopularPosts.onclick = () => {
            currentView = (currentView === 'all') ? 'popular' : 'all';
            if (boardTitle) boardTitle.innerText = currentView === 'popular' ? "게시판 (인기순)" : "게시판";
            renderPosts(allPosts);
        };
    }

    if (boardSearch) {
        boardSearch.oninput = (e) => {
            const term = e.target.value.toLowerCase();
            renderPosts(allPosts.filter(p => p.content.toLowerCase().includes(term) || p.author.toLowerCase().includes(term)));
        };
    }

    // Refined Scroll Trigger
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
                // Optional: Unobserve after reveal
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-section, .slide-up-section, .section-title-wrapper h2, .section-title-wrapper-centered h2').forEach(el => {
        observer.observe(el);
    });

    // Advanced 3D Living Parallax Effect
    const cards = document.querySelectorAll('.lineup-card');
    cards.forEach(card => {
        const img = card.querySelector('.card-image');
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Stronger 3D rotation
            const rotateX = (y - centerY) / 8; 
            const rotateY = (centerX - x) / 8;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
            
            if (img) {
                // Parallax background movement
                const moveX = (x - centerX) / 10;
                const moveY = (y - centerY) / 10;
                img.style.transform = `scale(1.2) translate3d(${moveX}px, ${moveY}px, 50px)`;
                img.style.filter = `brightness(1.2) saturate(1.2) drop-shadow(0 0 20px rgba(0, 113, 227, 0.4))`;
            }
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            if (img) {
                img.style.transform = `scale(1) translate3d(0, 0, 0)`;
                img.style.filter = `none`;
            }
        });
    });

    // Parallax & Scroll Sync Animations
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        // Background Parallax
        const stars = document.querySelector('body');
        stars.style.setProperty('--scroll-offset', -(scrolled * 0.15) + 'px');
    });
    
    document.querySelectorAll('.accordion-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.accordion-item, .media-container').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const target = document.querySelector(`.${item.getAttribute('data-image')}`);
            if (target) target.classList.add('active');
        });
    });

    // Premium Login Modal Logic
    const loginTrigger = document.getElementById('login-trigger');
    const loginModal = document.getElementById('login-modal');
    const closeLogin = document.querySelector('.close-modal');
    const loginForm = document.getElementById('login-form-premium');
    
    // Signup Elements
    const signupModal = document.getElementById('signup-modal');
    const signupLink = document.querySelector('.signup-link');
    const closeSignup = document.querySelector('.signup-close');
    const btnCancelSignup = document.querySelector('.btn-cancel');
    const signupForm = document.getElementById('signup-form-premium');

    if (loginTrigger && loginModal) {
        const toggleModal = (modal, show) => {
            if (show) {
                modal.style.display = 'flex';
                setTimeout(() => modal.classList.add('active'), 10);
                document.body.style.overflow = 'hidden';
            } else {
                modal.classList.remove('active');
                setTimeout(() => {
                    modal.style.display = 'none';
                    if (!document.querySelector('.modal-premium.active')) {
                        document.body.style.overflow = 'auto';
                    }
                }, 400);
            }
        };

        loginTrigger.onclick = (e) => {
            e.preventDefault();
            if (loginTrigger.classList.contains('logged-in')) {
                if (confirm("로그아웃 하시겠습니까?")) {
                    loginTrigger.innerHTML = '로그인';
                    loginTrigger.classList.remove('logged-in');
                    alert("로그아웃 되었습니다.");
                }
                return;
            }
            toggleModal(loginModal, true);
        };

        closeLogin.onclick = () => toggleModal(loginModal, false);
        
        signupLink.onclick = (e) => {
            e.preventDefault();
            toggleModal(loginModal, false);
            setTimeout(() => toggleModal(signupModal, true), 400);
        };

        closeSignup.onclick = () => toggleModal(signupModal, false);
        btnCancelSignup.onclick = () => toggleModal(signupModal, false);

        window.addEventListener('click', (e) => {
            if (e.target === loginModal) toggleModal(loginModal, false);
            if (e.target === signupModal) toggleModal(signupModal, false);
        });

        if (loginForm) {
            loginForm.onsubmit = (e) => {
                e.preventDefault();
                const id = document.getElementById('login-id').value;
                
                // Get registered users from localStorage
                const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
                const userExists = users.some(user => user.id === id);

                if (userExists) {
                    // Update Button to Show User Name
                    loginTrigger.innerHTML = `<span>👤</span> ${id}님`;
                    loginTrigger.classList.add('logged-in');
                    
                    alert(`${id}님, 로봇소프트웨어과 커뮤니티에 오신 것을 환영합니다!`);
                    toggleModal(loginModal, false);
                } else {
                    alert("가입되지 않은 아이디입니다. 먼저 회원가입을 해주세요.");
                }
            };
        }

        if (signupForm) {
            signupForm.onsubmit = (e) => {
                e.preventDefault();
                const name = document.getElementById('signup-name').value;
                const id = document.getElementById('signup-id').value; // Get the ID field
                
                // Get existing users
                let users = JSON.parse(localStorage.getItem('registered_users') || '[]');
                
                // Check if ID already exists
                if (users.some(user => user.id === id)) {
                    alert("이미 가입된 학번/교번입니다.");
                } else {
                    // Register new user
                    users.push({ id: id, name: name });
                    localStorage.setItem('registered_users', JSON.stringify(users));
                    
                    alert(`${name}님, 회원가입이 완료되었습니다! 이제 로그인할 수 있습니다.`);
                    toggleModal(signupModal, false);
                    setTimeout(() => toggleModal(loginModal, true), 500); // Open login modal after signup
                }
            };
        }
    }

    // Club Tab Logic
    const clubTabs = document.querySelectorAll('.tab-item');
    const clubName = document.getElementById('club-display-name');
    const clubDesc = document.getElementById('club-display-description');
    const clubImg = document.getElementById('club-display-img');

    const clubData = {
        mas: {
            title: "MAS",
            desc: "MAS는 학교에서 배우는 것 뿐만 아니라 더 나아가 사회에 도움이 될 수 있는 로봇을 직접 만들어 각종 대회에 출전해 학생들끼리 서로 협업을 하며 자신의 전공지식과 역량을 같이 키워나가는 로봇자동화공학부 전공동아리입니다.",
            img: "club-mas.png"
        },
        mca: {
            title: "MCA",
            desc: "MCA는 로봇 제어 시스템의 핵심인 임베디드 소프트웨어와 하드웨어 통합 제어를 연구합니다. MCU 기반의 정밀 제어 알고리즘 구현을 전문으로 하는 동아리입니다.",
            img: "tech_black_pcb_gold_1778724340258.png"
        },
        moas: {
            title: "MoAS",
            desc: "MoAS는 Mobile Autonomous System의 약자로, 자율 주행 로봇과 슬램(SLAM) 기술을 연구합니다. 다양한 센서를 이용한 정밀 매핑과 자율 주행 기술을 실현합니다.",
            img: "robot_joint_precision_1778724360860.png"
        },
        smart: {
            title: "SMART",
            desc: "SMART는 스마트 팩토리 공정 자동화와 공장 운영 소프트웨어를 연구합니다. PLC 제어 및 디지털 트윈 시뮬레이션을 통해 미래형 공장 시스템을 구축합니다.",
            img: "smart_factory_automation_grid_1778724665355.png"
        },
        ur: {
            title: "UR",
            desc: "UR은 Universal Robot의 활용을 연구하며 협동 로봇과의 안전한 협업 및 작업 자동화 기술을 개발합니다. 인간과 로봇의 인터페이스 디자인에 집중합니다.",
            img: "hero_robot_arm_premium_1778723378745.png"
        },
        intelligent: {
            title: "지능형로봇",
            desc: "지능형로봇 동아리는 인공지능과 딥러닝 기술을 로봇에 접목하여 스스로 판단하고 행동하는 로봇을 만듭니다. 영상 처리 및 음성 인식 알고리즘을 로봇 하드웨어에 이식합니다.",
            img: "blue_data_grid_blueprint_1778724377478.png"
        }
    };

    clubTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const club = tab.getAttribute('data-club');
            const data = clubData[club];

            if (data) {
                // Update active tab
                clubTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Animate content change
                const content = document.getElementById('club-content');
                content.style.opacity = '0';
                content.style.transform = 'translateY(10px)';

                setTimeout(() => {
                    clubName.innerText = data.title;
                    clubDesc.innerText = data.desc;
                    clubImg.src = data.img;
                    content.style.opacity = '1';
                    content.style.transform = 'translateY(0)';
                }, 300);
            }
        });
    });
});
