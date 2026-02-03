
        // ============================================
        // CONFIGURATION INITIALE
        // ============================================
        
        // Configuration Firebase
  const firebaseConfig = {
  apiKey: "AIzaSyBQsG8DzaxT1t6KOTGvUEdJpjbDgfUk7KY",
  authDomain: "smart-415e7.firebaseapp.com",
  projectId: "smart-415e7",
  storageBucket: "smart-415e7.firebasestorage.app",
  messagingSenderId: "905226910088",
  appId: "1:905226910088:web:03c20ee6926d5a74f5e23d",
  measurementId: "G-D8L1DKTFDE"
};

        
        // Variables globales
        let db;
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        let currentSlide = 0;
        let heroSlides = [];
        let heroInterval;
        let animationInstances = [];
        
        // ============================================
        // INITIALISATION DE L'APPLICATION
        // ============================================
        
        document.addEventListener('DOMContentLoaded', function() {
            // Initialiser Firebase
            initializeFirebase();
            
            // Configurer les écouteurs d'événements
            setupEventListeners();
            
            // Gérer l'animation du loader
            handleLoaderAnimation();
            
            // Mettre à jour le compteur du panier
            updateCartCount();
            
            // Initialiser l'intersection observer pour les animations au scroll
            initScrollAnimations();
        });
        
        // ============================================
        // FONCTIONS D'INITIALISATION
        // ============================================
        
        function initializeFirebase() {
            try {
                // Vérifier si Firebase est disponible
                if (typeof firebase === 'undefined') {
                    console.error('Firebase SDK non chargé');
                    return;
                }
                
                // Initialiser Firebase
                firebase.initializeApp(firebaseConfig);
                db = firebase.firestore();
                
                // Configurer pour le développement local si nécessaire
                if (window.location.hostname === "localhost") {
                    db.settings({
                        host: "localhost:8080",
                        ssl: false
                    });
                }
                
                // Charger les données après l'initialisation
                setTimeout(() => {
                    loadInitialData();
                    loadFooterData();
                }, 3000);
                
            } catch (error) {
                console.error('Erreur lors de l\'initialisation de Firebase:', error);
            }
        }
        
        function setupEventListeners() {
            // Navigation mobile
            document.getElementById('mobile-menu-toggle').addEventListener('click', toggleMobileMenu);
            document.getElementById('mobile-cart-icon').addEventListener('click', openCartModal);
            document.getElementById('cart-icon').addEventListener('click', openCartModal);
            
            // Panier
            document.getElementById('close-cart').addEventListener('click', closeCartModal);
            document.getElementById('cart-modal-backdrop').addEventListener('click', closeCartModal);
            document.getElementById('checkout-btn').addEventListener('click', proceedToCheckout);
            document.getElementById('cta-cart').addEventListener('click', openCartModal);
            
            // Slider Hero
            document.getElementById('prev-slide').addEventListener('click', () => navigateSlide(-1));
            document.getElementById('next-slide').addEventListener('click', () => navigateSlide(1));
            
            // Navigation
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', smoothScroll);
            });
            
            // Prévenir les formulaires
            document.querySelectorAll('form').forEach(form => {
                form.addEventListener('submit', e => e.preventDefault());
            });
        }
        
        // ============================================
        // 🎬 1️⃣ GESTION DU LOADER AVEC ANIME.JS
        // ============================================
        
        function handleLoaderAnimation() {
            // Animation de la barre de progression
            const progressAnimation = anime({
                targets: '#loader-progress',
                width: '100%',
                duration: 2500,
                easing: 'easeInOutQuad',
                complete: function() {
                    // Cacher le loader après 3 secondes
                    setTimeout(() => {
                        const loaderAnimation = anime({
                            targets: '#loader',
                            opacity: 0,
                            duration: 500,
                            easing: 'easeOutQuad',
                            complete: function() {
                                document.getElementById('loader').style.display = 'none';
                                
                                // Afficher le contenu principal
                                anime({
                                    targets: ['#header', '#main-content'],
                                    opacity: [0, 1],
                                    duration: 800,
                                    easing: 'easeOutQuad',
                                    delay: anime.stagger(100)
                                });
                            }
                        });
                        animationInstances.push(loaderAnimation);
                    }, 500);
                }
            });
            
            // Animation du logo
            const logoAnimation = anime({
                targets: '#loader-logo',
                opacity: [0, 1],
                scale: [0.8, 1],
                duration: 1500,
                easing: 'easeOutBack',
                delay: 500
            });
            
            animationInstances.push(progressAnimation, logoAnimation);
            
            // Stocker que le loader a été affiché
            sessionStorage.setItem('loaderShown', 'true');
        }
        
        // ============================================
        // ANIMATIONS AU SCROLL AVEC ANIME.JS
        // ============================================
        
        function initScrollAnimations() {
            // Créer un Intersection Observer pour les animations au scroll
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        
                        // Vérifier la classe pour l'animation appropriée
                        if (element.classList.contains('fade-in')) {
                            animateFadeIn(element);
                        } else if (element.classList.contains('fade-in-left')) {
                            animateFadeInLeft(element);
                        } else if (element.classList.contains('fade-in-right')) {
                            animateFadeInRight(element);
                        } else if (element.classList.contains('scale-in')) {
                            animateScaleIn(element);
                        }
                        
                        // Arrêter d'observer après l'animation
                        observer.unobserve(element);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });
            
            // Observer tous les éléments avec des classes d'animation
            document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .scale-in').forEach(el => {
                observer.observe(el);
            });
        }
        
        function animateFadeIn(element) {
            const animation = anime({
                targets: element,
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 800,
                easing: 'easeOutQuad',
                delay: anime.stagger(100, {grid: [4, 4], from: 'center'})
            });
            animationInstances.push(animation);
        }
        
        function animateFadeInLeft(element) {
            const animation = anime({
                targets: element,
                opacity: [0, 1],
                translateX: [-20, 0],
                duration: 800,
                easing: 'easeOutQuad'
            });
            animationInstances.push(animation);
        }
        
        function animateFadeInRight(element) {
            const animation = anime({
                targets: element,
                opacity: [0, 1],
                translateX: [20, 0],
                duration: 800,
                easing: 'easeOutQuad'
            });
            animationInstances.push(animation);
        }
        
        function animateScaleIn(element) {
            const animation = anime({
                targets: element,
                opacity: [0, 1],
                scale: [0.9, 1],
                duration: 800,
                easing: 'easeOutBack'
            });
            animationInstances.push(animation);
        }
        
        function animateStaggerElements(elements) {
            const animation = anime({
                targets: elements,
                opacity: [0, 1],
                translateY: [30, 0],
                duration: 600,
                easing: 'easeOutQuad',
                delay: anime.stagger(100)
            });
            animationInstances.push(animation);
        }
        
        // ============================================
        // 🧭 2️⃣ NAVIGATION
        // ============================================
        
        function toggleMobileMenu() {
            const menu = document.getElementById('mobile-menu');
            const icon = document.getElementById('mobile-menu-toggle').querySelector('i');
            
            if (menu.classList.contains('hidden')) {
                menu.classList.remove('hidden');
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                
                // Animation d'ouverture
                anime({
                    targets: menu,
                    height: [0, menu.scrollHeight],
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            } else {
                anime({
                    targets: menu,
                    height: [menu.scrollHeight, 0],
                    duration: 300,
                    easing: 'easeOutQuad',
                    complete: function() {
                        menu.classList.add('hidden');
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                });
            }
        }
        
        function smoothScroll(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#')) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    anime({
                        targets: document.documentElement,
                        scrollTop: targetElement.offsetTop - 80,
                        duration: 800,
                        easing: 'easeInOutQuad'
                    });
                    
                    // Fermer le menu mobile si ouvert
                    const menu = document.getElementById('mobile-menu');
                    if (!menu.classList.contains('hidden')) {
                        toggleMobileMenu();
                    }
                }
            }
        }
        
        // ============================================
        // 🟢 3️⃣ HERO SLIDER AVEC ANIME.JS
        // ============================================
        
        function loadHeroProducts() {
            if (!db) return;
            
            db.collection('products')
                .where('showInHero', '==', true)
                .limit(5)
                .get()
                .then(querySnapshot => {
                    if (querySnapshot.empty) {
                        showEmptyState('hero-content', 'Aucun produit vedette disponible');
                        return;
                    }
                    
                    heroSlides = [];
                    querySnapshot.forEach(doc => {
                        heroSlides.push({ id: doc.id, ...doc.data() });
                    });
                    
                    renderHeroSlider();
                    startHeroSlider();
                })
                .catch(error => {
                    console.error('Erreur lors du chargement des produits hero:', error);
                    showErrorState('hero-content', 'Erreur de chargement');
                });
        }
        
        function renderHeroSlider() {
            const slider = document.getElementById('hero-slider');
            const indicators = document.getElementById('slide-indicators');
            const heroContent = document.getElementById('hero-content');
            
            slider.innerHTML = '';
            indicators.innerHTML = '';
            
            heroSlides.forEach((slide, index) => {
                // Slide background
                const slideElement = document.createElement('div');
                slideElement.className = `absolute inset-0 ${index === 0 ? 'opacity-100' : 'opacity-0'}`;
                slideElement.style.backgroundImage = `url('${slide.imageName || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1920'}')`;
                slideElement.style.backgroundSize = 'cover';
                slideElement.style.backgroundPosition = 'center';
                slideElement.dataset.index = index;
                slider.appendChild(slideElement);
                
                // Indicator
                const indicator = document.createElement('button');
                indicator.className = `w-3 h-3 rounded-full ${index === 0 ? 'bg-white' : 'bg-white/50'}`;
                indicator.dataset.index = index;
                indicator.addEventListener('click', () => goToSlide(index));
                indicators.appendChild(indicator);
            });
            
            // Contenu du premier slide
            if (heroSlides.length > 0) {
                updateHeroContent(0);
            }
        }
        
        function updateHeroContent(slideIndex) {
            const slide = heroSlides[slideIndex];
            const heroContent = document.getElementById('hero-content');
            
            heroContent.innerHTML = `
    <p class="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold mb-1 sm:mb-2 md:mb-3 lg:mb-4">
        ${slide.name || 'Produit Premium'}
    <p>
    
    <div class="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-2 sm:mb-3 md:mb-4 lg:mb-6">
        <span class="font-bold">${(slide.price || 0)} G</span>
        ${slide.showOldPrice && slide.oldPrice ? 
            `<span class="line-through text-gray-300 ml-1 sm:ml-2">${(slide.oldPrice)} G</span>` : 
            ''}
    </div>
    
    <p class="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl mb-2 sm:mb-3 md:mb-4 lg:mb-6 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl mx-auto opacity-90 px-2 leading-tight sm:leading-normal">
        ${slide.description || 'Découvrez l\'excellence'}
    </p>
    
    <a href="catalogue.html">
        <button class="btn-hero inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 lg:px-6 lg:py-3 xl:px-7 xl:py-3.5 rounded-full font-semibold text-xs sm:text-sm md:text-base lg:text-lg transition-all duration-300"
                data-product-id="${slide.id}">
            <i class="fas fa-cart-plus mr-1 sm:mr-2 text-xs sm:text-sm"></i>
            Voir dans le catalogue
        </button>
    </a>    `;
            
            // Ajouter l'écouteur d'événement au bouton
            const addToCartBtn = heroContent.querySelector('.btn-hero');
            if (addToCartBtn) {
                addToCartBtn.addEventListener('click', function() {
                    addToCart(slide.id, slide.name, slide.price, slide.imageName);
                });
            }
            
            // Animation du contenu avec Anime.js
            if (heroContent.children.length > 0) {
                const animation = anime({
                    targets: heroContent.children,
                    opacity: [0, 1],
                    translateY: [30, 0],
                    duration: 800,
                    easing: 'easeOutQuad',
                    delay: anime.stagger(100)
                });
                animationInstances.push(animation);
            }
        }
        
        function navigateSlide(direction) {
            if (heroSlides.length === 0) return;
            
            const newIndex = (currentSlide + direction + heroSlides.length) % heroSlides.length;
            goToSlide(newIndex);
        }
        
        function goToSlide(index) {
            if (index === currentSlide || heroSlides.length === 0) return;
            
            const slides = document.querySelectorAll('#hero-slider > div');
            const indicators = document.querySelectorAll('#slide-indicators button');
            
            // Animation de transition avec Anime.js
            const currentSlideAnim = anime({
                targets: slides[currentSlide],
                opacity: 0,
                duration: 500,
                easing: 'easeInOutQuad'
            });
            
            const nextSlideAnim = anime({
                targets: slides[index],
                opacity: 1,
                duration: 500,
                easing: 'easeInOutQuad',
                delay: 300
            });
            
            // Mettre à jour les indicateurs
            indicators[currentSlide].classList.remove('bg-white');
            indicators[currentSlide].classList.add('bg-white/50');
            indicators[index].classList.remove('bg-white/50');
            indicators[index].classList.add('bg-white');
            
            // Mettre à jour le contenu
            updateHeroContent(index);
            
            currentSlide = index;
            resetHeroInterval();
            
            animationInstances.push(currentSlideAnim, nextSlideAnim);
        }
        
        function startHeroSlider() {
            if (heroSlides.length > 1) {
                heroInterval = setInterval(() => {
                    navigateSlide(1);
                }, 5000);
            }
        }
        
        function resetHeroInterval() {
            clearInterval(heroInterval);
            startHeroSlider();
        }
        
        // ============================================
        // 🟡 4️⃣ SECTION AVANTAGES
        // ============================================
        
        function loadAdvantages() {
            if (!db) return;
            
            db.collection('home_content')
                .doc('advantages')
                .get()
                .then(doc => {
                    if (!doc.exists) {
                        // Créer le document avec des valeurs par défaut
                        const defaultAdvantages = {
                            items: [
                                {
                                    icon: 'fas fa-truck',
                                    title: 'Livraison Rapide',
                                    description: 'Recevez vos produits en 24-48h'
                                },
                                {
                                    icon: 'fas fa-shield-alt',
                                    title: 'Garantie Satisfait',
                                    description: '30 jours pour changer d\'avis'
                                },
                                {
                                    icon: 'fas fa-headset',
                                    title: 'Support 24/7',
                                    description: 'Notre équipe vous accompagne'
                                },
                                {
                                    icon: 'fas fa-award',
                                    title: 'Qualité Premium',
                                    description: 'Des produits sélectionnés avec soin'
                                }
                            ]
                        };
                        
                        return db.collection('home_content').doc('advantages').set(defaultAdvantages)
                            .then(() => {
                                return { data: () => defaultAdvantages };
                            });
                    }
                    
                    return doc;
                })
                .then(doc => {
                    const data = doc.data();
                    const advantages = data.items || [];
                    
                    if (advantages.length === 0) {
                        showEmptyState('advantages-container', 'Aucun avantage configuré');
                        return;
                    }
                    
                    renderAdvantages(advantages);
                })
                .catch(error => {
                    console.error('Erreur lors du chargement des avantages:', error);
                    showErrorState('advantages-container', 'Erreur de chargement');
                });
        }
        
        function renderAdvantages(advantages) {
            const container = document.getElementById('advantages-container');
            
            if (!container) return;
            
            container.innerHTML = '';
            
            // Limiter à 4 avantages maximum
            const displayAdvantages = advantages.slice(0, 4);
            
            displayAdvantages.forEach((advantage, index) => {
                const card = document.createElement('div');
                card.className = 'text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 fade-in';
                card.innerHTML = `
                    <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <i class="${advantage.icon || 'fas fa-star'} text-primary text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-3">${advantage.title || 'Avantage'}</h3>
                    <p class="text-gray-600">${advantage.description || 'Description non disponible'}</p>
                `;
                container.appendChild(card);
            });
            
            // Observer les nouvelles cartes pour les animations
            setTimeout(() => {
                initScrollAnimations();
            }, 100);
        }
        
        // ============================================
        // 🔵 5️⃣ PRODUITS POPULAIRES
        // ============================================
        
        function loadFeaturedProducts() {
            if (!db) return;
            
            // D'abord essayer de charger les produits populaires
            db.collection('products')
                .where('isPopular', '==', true)
                .limit(8)
                .get()
                .then(querySnapshot => {
                    if (querySnapshot.empty) {
                        // Essayer avec isNew si aucun produit populaire
                        return db.collection('products')
                            .where('isNew', '==', true)
                            .limit(8)
                            .get();
                    }
                    
                    return querySnapshot;
                })
                .then(querySnapshot => {
                    if (querySnapshot.empty) {
                        // Charger les 8 premiers produits
                        return db.collection('products')
                            .limit(8)
                            .get();
                    }
                    
                    return querySnapshot;
                })
                .then(querySnapshot => {
                    if (querySnapshot.empty) {
                        showEmptyState('products-container', 'Aucun produit disponible pour le moment');
                        return;
                    }
                    
                    const products = [];
                    querySnapshot.forEach(doc => {
                        products.push({ id: doc.id, ...doc.data() });
                    });
                    
                    renderFeaturedProducts(products);
                })
                .catch(error => {
                    console.error('Erreur lors du chargement des produits:', error);
                    showErrorState('products-container', 'Erreur de chargement');
                });
        }
function renderFeaturedProducts(products) {
    const container = document.getElementById('products-container');
    if (!container) return;

    container.innerHTML = '';

    // Limite design
    const displayProducts = products.slice(0, 4);

    displayProducts.forEach((product, index) => {
        // 📸 Images du produit
        const images = Array.isArray(product.images) && product.images.length
            ? product.images
            : [
                product.imageName ||
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
              ];

        const sliderId = `slider-${index}`;

        const card = document.createElement('div');
        card.className =
            'product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group fade-in';

        card.innerHTML = `
            <div class="relative overflow-hidden h-64 select-none" id="${sliderId}">
                
                <!-- Slider track -->
                <div class="slider-track flex h-full transition-transform duration-300 ease-out">
                    ${images.map((img, imgIndex) => `
                        <div class="min-w-full h-full">
                            <img
                                src="${img}"
                                class="product-image w-full h-full object-cover cursor-zoom-in"
                                data-product-index="${index}"
                                data-image-index="${imgIndex}"
                                loading="lazy"
                                onerror="this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'"
                            />
                        </div>
                    `).join('')}
                </div>

                <!-- Dots -->
                ${images.length > 1 ? `
                    <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                        ${images.map((_, i) => `
                            <div class="slider-dot w-2 h-2 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/50'}"></div>
                        `).join('')}
                    </div>
                ` : ''}

                ${product.isNew ? `
                    <div class="absolute top-4 right-4 bg-accent text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Nouveau
                    </div>` : ''}

                ${product.isPopular ? `
                    <div class="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Populaire
                    </div>` : ''}
            </div>

            <div class="p-6">
                <h3 class="text-xl font-semibold text-gray-800 mb-2 truncate">
                    ${product.name || 'Produit'}
                </h3>

               <div class="flex flex-col mb-4">
    <div class="text-lg font-bold text-primary">
        ${(product.price || 0)} G
    </div>

    ${
        product.showOldPrice && product.oldPrice
            ? `<div class="text-gray-400 line-through text-sm">
                ${product.oldPrice} G
               </div>`
            : ''
    }
</div>


                <a href="catalogue.html">
                    <button class="btn-primary w-full py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02]">
                        <i class="fas fa-cart-plus mr-2"></i>
                        Voir 
                    </button>
                </a>
            </div>
        `;

        container.appendChild(card);

        // 🖱️ CLICK IMAGE → MODAL FULLSCREEN AVEC SLIDER
        const imageElements = card.querySelectorAll('.product-image');
        imageElements.forEach(imgEl => {
            imgEl.addEventListener('click', () => {
                const productIndex = parseInt(imgEl.dataset.productIndex);
                const imageIndex = parseInt(imgEl.dataset.imageIndex);

                const modalImages =
                    products[productIndex].images?.length
                        ? products[productIndex].images
                        : [products[productIndex].imageName];

                openImageModal(modalImages, imageIndex);
            });
        });

        // 📱 Swipe du slider carte
        if (images.length > 1) {
            initSwipeSlider(sliderId);
        }
    });

    // Animations scroll
    setTimeout(() => {
        initScrollAnimations();
    }, 100);
}

function initSwipeSlider(sliderId) {
    const slider = document.getElementById(sliderId);
    const track = slider.querySelector('.slider-track');
    const dots = slider.querySelectorAll('.slider-dot');
    const slides = track.children;

    let index = 0;
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    function updateSlider() {
        track.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach((d, i) => {
            d.classList.toggle('bg-white', i === index);
            d.classList.toggle('bg-white/50', i !== index);
        });
    }

    // Touch events (mobile)
    slider.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
        isDragging = true;
    });

    slider.addEventListener('touchmove', e => {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
    });

    slider.addEventListener('touchend', () => {
        if (!isDragging) return;
        const diff = startX - currentX;

        if (diff > 50 && index < slides.length - 1) index++;
        if (diff < -50 && index > 0) index--;

        updateSlider();
        isDragging = false;
    });

    // Mouse drag (desktop)
    slider.addEventListener('mousedown', e => {
        startX = e.clientX;
        isDragging = true;
    });

    slider.addEventListener('mousemove', e => {
        if (!isDragging) return;
        currentX = e.clientX;
    });

    slider.addEventListener('mouseup', () => {
        if (!isDragging) return;
        const diff = startX - currentX;

        if (diff > 50 && index < slides.length - 1) index++;
        if (diff < -50 && index > 0) index--;

        updateSlider();
        isDragging = false;
    });

    slider.addEventListener('mouseleave', () => {
        isDragging = false;
    });
}

// ============================================
        // 🟣 6️⃣ SECTION PROCESSUS
        // ============================================
        
        function loadProcess() {
            if (!db) return;
            
            const container = document.getElementById('process-container');
            
            db.collection('home_content')
                .doc('process')
                .get()
                .then(doc => {
                    if (!doc.exists) {
                        container.innerHTML = '';
                        return;
                    }
                    
                    const data = doc.data();
                    
                    if (!data.enabled) {
                        container.innerHTML = '';
                        return;
                    }
                    
                    renderProcess();
                })
                .catch(error => {
                    console.error('Erreur lors du chargement du processus:', error);
                });
        }
        
        function renderProcess() {
            const container = document.getElementById('process-container');
            
            const steps = [
                {
                    icon: 'fas fa-box-open',
                    title: 'Choisir un produit',
                    description: 'Parcourez notre catalogue et sélectionnez vos articles préférés'
                },
                {
                    icon: 'fas fa-cart-plus',
                    title: 'Ajouter au panier',
                    description: 'Ajoutez les produits à votre panier en un seul clic'
                },
                {
                    icon: 'fas fa-shipping-fast',
                    title: 'Choisir la livraison',
                    description: 'Sélectionnez le mode de livraison qui vous convient'
                },
                {
                    icon: 'fas fa-file-pdf',
                    title: 'Valider & recevoir',
                    description: 'Validez votre commande et recevez votre code PDF'
                }
            ];
            
            container.innerHTML = '';
            
            steps.forEach((step, index) => {
                const stepElement = document.createElement('div');
                stepElement.className = 'text-center p-6 fade-in';
                stepElement.innerHTML = `
                    <div class="relative mb-6">
                        <div class="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                            <i class="${step.icon} text-primary text-2xl"></i>
                        </div>
                        ${index < steps.length - 1 ? 
                            `<div class="hidden lg:block absolute top-10 left-3/4 w-full h-1 bg-primary/20"></div>` : ''}
                    </div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-3">${step.title}</h3>
                    <p class="text-gray-600">${step.description}</p>
                `;
                container.appendChild(stepElement);
            });
            
            // Observer les nouvelles étapes pour les animations
            setTimeout(() => {
                initScrollAnimations();
            }, 100);
        }
        
        // ============================================
        // 🟠 7️⃣ OPTIONS DE LIVRAISON
        // ============================================
        
        function loadDeliveryOptions() {
            if (!db) return;
            
            const container = document.getElementById('delivery-container');
            
            db.collection('home_content')
                .doc('delivery_display')
                .get()
                .then(doc => {
                    if (!doc.exists) {
                        container.innerHTML = '';
                        document.getElementById('delivery').style.display = 'none';
                        return;
                    }
                    
                    const data = doc.data();
                    
                    if (!data.enabled) {
                        container.innerHTML = '';
                        document.getElementById('delivery').style.display = 'none';
                        return;
                    }
                    
                    renderDeliveryOptions();
                })
                .catch(error => {
                    console.error('Erreur lors du chargement des options de livraison:', error);
                    document.getElementById('delivery').style.display = 'none';
                });
        }
        
        function renderDeliveryOptions() {
            const container = document.getElementById('delivery-container');
            
            const options = [
                {
                    icon: 'fas fa-home',
                    title: 'Livraison à domicile',
                    description: 'Recevez votre commande directement chez vous'
                },
                {
                    icon: 'fas fa-handshake',
                    title: 'Rencontre',
                    description: 'Récupérez votre commande en personne'
                },
                {
                    icon: 'fas fa-store',
                    title: 'Point de vente',
                    description: 'Retirez votre commande dans nos magasins partenaires'
                }
            ];
            
            container.innerHTML = '';
            
            options.forEach(option => {
                const optionElement = document.createElement('div');
                optionElement.className = 'text-center p-6 bg-gray-50 rounded-xl fade-in';
                optionElement.innerHTML = `
                    <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <i class="${option.icon} text-primary text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-3">${option.title}</h3>
                    <p class="text-gray-600">${option.description}</p>
                `;
                container.appendChild(optionElement);
            });
            
            // Observer les nouvelles options pour les animations
            setTimeout(() => {
                initScrollAnimations();
            }, 100);
        }
        
        // ============================================
        // 🔴 8️⃣ CTA FINAL
        // ============================================
        
        function loadCTA() {
            if (!db) return;
            
            const container = document.getElementById('cta-container');
            
            db.collection('home_content')
                .doc('cta')
                .get()
                .then(doc => {
                    if (!doc.exists) {
                        // Utiliser les valeurs par défaut
                        return {
                            title: 'Prêt à découvrir nos produits ?',
                            subtitle: 'Rejoignez des milliers de clients satisfaits'
                        };
                    }
                    
                    return doc.data();
                })
                .then(data => {
                    renderCTA(data);
                })
                .catch(error => {
                    console.error('Erreur lors du chargement du CTA:', error);
                    // Utiliser les valeurs par défaut en cas d'erreur
                    renderCTA({
                        title: 'Prêt à découvrir nos produits ?',
                        subtitle: 'Rejoignez des milliers de clients satisfaits'
                    });
                });
        }
        
        function renderCTA(data) {
            const container = document.getElementById('cta-container');
            
            container.innerHTML = `
                <h2 class="text-3xl md:text-4xl font-bold mb-6">${data.title}</h2>
                <p class="text-xl mb-10 max-w-2xl mx-auto">${data.subtitle}</p>
                
                <div class="flex flex-col sm:flex-row justify-center gap-4">
                    <a href="catalogue.html" class="bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-[1.02] inline-flex items-center justify-center shadow-lg">
                        <i class="fas fa-store mr-2"></i>
                        Accéder au catalogue
                    </a>
                    <a href="#" id="cta-cart" class="bg-transparent border-2 border-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300 transform hover:scale-[1.02] inline-flex items-center justify-center">
                        <i class="fas fa-shopping-cart mr-2"></i>
                        Voir le panier
                    </a>
                </div>
            `;
            
            // Re-attacher l'événement
            const ctaCartBtn = document.getElementById('cta-cart');
            if (ctaCartBtn) {
                ctaCartBtn.addEventListener('click', openCartModal);
            }
            
            // Animation du CTA
            setTimeout(() => {
                const animation = anime({
                    targets: container,
                    opacity: [0, 1],
                    scale: [0.9, 1],
                    duration: 800,
                    easing: 'easeOutBack'
                });
                animationInstances.push(animation);
            }, 100);
        }
        
        // ============================================
        // 🧱 1️⃣0️⃣ FOOTER
        // ============================================
        
        function loadFooterData() {
            if (!db) return;
            
            const container = document.getElementById('footer-content');
            
            db.collection('footer_content')
                .doc('data')
                .get()
                .then(doc => {
                    if (!doc.exists) {
                        renderDefaultFooter();
                        return;
                    }
                    
                    const data = doc.data();
                    renderFooter(data);
                })
                .catch(error => {
                    console.error('Erreur lors du chargement du footer:', error);
                    renderDefaultFooter();
                });
            
            // Mettre à jour l'année courante
            document.getElementById('current-year').textContent = new Date().getFullYear();
        }
        
        function renderFooter(data) {
            const container = document.getElementById('footer-content');
            
            let footerHTML = '<div class="grid grid-cols-1 md:grid-cols-4 gap-8">';
            
            // Section 1: À propos
            if (data.about) {
                footerHTML += `
                    <div>
                        <h3 class="text-xl font-bold mb-4">${data.about.title || 'À propos'}</h3>
                        <p class="text-gray-400 mb-4">${data.about.description || ''}</p>
                        ${data.about.social ? renderSocialIcons(data.about.social) : ''}
                    </div>
                `;
            }
            
            // Section 2: Liens rapides
            if (data.quickLinks) {
                footerHTML += `
                    <div>
                        <h3 class="text-xl font-bold mb-4">${data.quickLinks.title || 'Liens rapides'}</h3>
                        <ul class="space-y-2">
                            ${data.quickLinks.links ? data.quickLinks.links.map(link => 
                                `<li><a href="${link.url || '#'}" class="text-gray-400 hover:text-white transition-colors">${link.text || 'Lien'}</a></li>`
                            ).join('') : ''}
                        </ul>
                    </div>
                `;
            }
            
            // Section 3: Contact
            if (data.contact) {
                footerHTML += `
                    <div>
                        <h3 class="text-xl font-bold mb-4">${data.contact.title || 'Contact'}</h3>
                        <ul class="space-y-3">
                            ${data.contact.email ? 
                                `<li class="flex items-center text-gray-400">
                                    <i class="fas fa-envelope mr-3"></i>
                                    ${data.contact.email}
                                </li>` : ''}
                            ${data.contact.phone ? 
                                `<li class="flex items-center text-gray-400">
                                    <i class="fas fa-phone mr-3"></i>
                                    ${data.contact.phone}
                                </li>` : ''}
                            ${data.contact.address ? 
                                `<li class="flex items-start text-gray-400">
                                    <i class="fas fa-map-marker-alt mr-3 mt-1"></i>
                                    <span>${data.contact.address}</span>
                                </li>` : ''}
                        </ul>
                    </div>
                `;
            }
            
            // Section 4: Newsletter
            if (data.newsletter && data.newsletter.enabled) {
                footerHTML += `
                    <div>
                        <h3 class="text-xl font-bold mb-4">${data.newsletter.title || 'Newsletter'}</h3>
                        <p class="text-gray-400 mb-4">${data.newsletter.description || ''}</p>
                        <form id="newsletter-form" class="flex">
                            <input type="email" 
                                   placeholder="Votre email" 
                                   class="flex-grow px-4 py-2 rounded-l-lg bg-gray-800 text-white border-0 focus:ring-2 focus:ring-primary focus:outline-none">
                            <button type="submit" class="bg-primary text-white px-4 py-2 rounded-r-lg hover:bg-secondary transition-colors">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </form>
                    </div>
                `;
            }
            
            footerHTML += '</div>';
            container.innerHTML = footerHTML;
            
            // Ajouter l'écouteur d'événement pour la newsletter
            const newsletterForm = document.getElementById('newsletter-form');
            if (newsletterForm) {
                newsletterForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const email = this.querySelector('input[type="email"]').value;
                    subscribeToNewsletter(email);
                });
            }
        }
        
        function renderDefaultFooter() {
            const container = document.getElementById('footer-content');
            
            container.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 class="text-xl font-bold mb-4">Smart cut services</h3>
                        <p class="text-gray-400 mb-4">Votre boutique en ligne premium pour des produits d'exception.</p>
                        <div class="flex space-x-4">
                            <a href="#" class="text-gray-400 hover:text-white transition-colors"><i class="fab fa-facebook-f"></i></a>
                            <a href="#" class="text-gray-400 hover:text-white transition-colors"><i class="fab fa-twitter"></i></a>
                            <a href="#" class="text-gray-400 hover:text-white transition-colors"><i class="fab fa-instagram"></i></a>
                        </div>
                    </div>
                    
                    <div>
                        <h3 class="text-xl font-bold mb-4">Liens rapides</h3>
                        <ul class="space-y-2">
                            <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Accueil</a></li>
                            <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Catalogue</a></li>
                            <li><a href="#" class="text-gray-400 hover:text-white transition-colors">À propos</a></li>
                            <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 class="text-xl font-bold mb-4">Contact</h3>
                        <ul class="space-y-3">
                            <li class="flex items-center text-gray-400">
                                <i class="fas fa-envelope mr-3"></i>
                                contact@Smart cut services.com
                            </li>
                            <li class="flex items-center text-gray-400">
                                <i class="fas fa-phone mr-3"></i>
                                +33 1 23 45 67 89
                            </li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 class="text-xl font-bold mb-4">Newsletter</h3>
                        <p class="text-gray-400 mb-4">Inscrivez-vous pour recevoir nos offres exclusives.</p>
                        <form id="newsletter-form" class="flex">
                            <input type="email" 
                                   placeholder="Votre email" 
                                   class="flex-grow px-4 py-2 rounded-l-lg bg-gray-800 text-white border-0 focus:ring-2 focus:ring-primary focus:outline-none">
                            <button type="submit" class="bg-primary text-white px-4 py-2 rounded-r-lg hover:bg-secondary transition-colors">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </form>
                    </div>
                </div>
            `;
            
            // Ajouter l'écouteur d'événement pour la newsletter
            const newsletterForm = document.getElementById('newsletter-form');
            if (newsletterForm) {
                newsletterForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const email = this.querySelector('input[type="email"]').value;
                    subscribeToNewsletter(email);
                });
            }
        }
        
        function renderSocialIcons(social) {
            const icons = {
                facebook: 'fab fa-facebook-f',
                twitter: 'fab fa-twitter',
                instagram: 'fab fa-instagram',
                linkedin: 'fab fa-linkedin-in',
                youtube: 'fab fa-youtube'
            };
            
            let html = '<div class="flex space-x-4">';
            
            for (const [platform, url] of Object.entries(social)) {
                if (url && icons[platform]) {
                    html += `<a href="${url}" class="text-gray-400 hover:text-white transition-colors">
                                <i class="${icons[platform]}"></i>
                            </a>`;
                }
            }
            
            html += '</div>';
            return html;
        }
        
        // ============================================
        // 🛒 GESTION DU PANIER
        // ============================================
        
        function addToCart(productId, productName, productPrice, productImage) {
            // Vérifier si le produit est déjà dans le panier
            const existingItem = cart.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: productId,
                    name: productName,
                    price: productPrice,
                    image: productImage,
                    quantity: 1
                });
            }
            
            // Sauvegarder dans localStorage
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Mettre à jour l'interface
            updateCartCount();
            updateCartModal();
            
            // Afficher une notification
            showNotification('Produit ajouté au panier !');
            
            // Animation du bouton avec Anime.js
            const button = event ? event.target.closest('button') : null;
            if (button) {
                const animation = anime({
                    targets: button,
                    scale: [1, 1.1, 1],
                    duration: 400,
                    easing: 'easeInOutQuad'
                });
                animationInstances.push(animation);
            }
        }
        
        function removeFromCart(productId) {
            cart = cart.filter(item => item.id !== productId);
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            updateCartModal();
            showNotification('Produit retiré du panier');
        }
        
        function updateCartCount() {
            const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
            
            const cartCountElements = document.querySelectorAll('[id*="cart-count"]');
            cartCountElements.forEach(element => {
                if (totalItems > 0) {
                    element.textContent = totalItems;
                    element.classList.remove('hidden');
                } else {
                    element.classList.add('hidden');
                }
            });
        }
        
        function updateCartModal() {
            const cartItemsContainer = document.getElementById('cart-items');
            const cartTotalElement = document.getElementById('cart-total');
            
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '<p class="text-gray-500 text-center py-8">Votre panier est vide</p>';
                cartTotalElement.textContent = '0,00 HTG';
                return;
            }
            
            let itemsHTML = '';
            let total = 0;
            
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                
                itemsHTML += `
                    <div class="flex items-center py-4 border-b border-gray-100">
                        <img src="${item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop'}" 
                             alt="${item.name}"
                             class="w-16 h-16 object-cover rounded-lg">
                        <div class="ml-4 flex-grow">
                            <h4 class="font-semibold">${item.name}</h4>
                            <p class="text-gray-600">${formatPrice(item.price)} × ${item.quantity}</p>
                        </div>
                        <div class="text-right">
                            <p class="font-semibold">${formatPrice(itemTotal)}</p>
                            <button class="text-red-500 hover:text-red-700 mt-1 text-sm"
                                    onclick="removeFromCart('${item.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
            
            cartItemsContainer.innerHTML = itemsHTML;
            cartTotalElement.textContent = formatPrice(total);
        }
        
        function openCartModal() {
            updateCartModal();
            const modal = document.getElementById('cart-modal');
            modal.classList.remove('hidden');
            
            setTimeout(() => {
                const cartPanel = modal.querySelector('div:nth-child(2)');
                const animation = anime({
                    targets: cartPanel,
                    translateX: ['100%', '0%'],
                    duration: 300,
                    easing: 'easeOutQuad'
                });
                animationInstances.push(animation);
            }, 10);
        }
        
        function closeCartModal() {
            const modal = document.getElementById('cart-modal');
            const cartPanel = modal.querySelector('div:nth-child(2)');
            
            const animation = anime({
                targets: cartPanel,
                translateX: ['0%', '100%'],
                duration: 300,
                easing: 'easeInQuad',
                complete: function() {
                    modal.classList.add('hidden');
                }
            });
            animationInstances.push(animation);
        }
        
        function proceedToCheckout() {
            if (cart.length === 0) {
                showNotification('Votre panier est vide', 'error');
                return;
            }
            
            showNotification('Redirection vers le paiement...');
            setTimeout(() => {
                alert('Fonctionnalité de paiement à implémenter');
            }, 500);
        }
        
        // ============================================
        // 📄 FONCTIONS UTILITAIRES
        // ============================================
        
        function loadInitialData() {
            loadHeroProducts();
            loadAdvantages();
            loadFeaturedProducts();
            loadProcess();
            loadDeliveryOptions();
            loadCTA();
        }
        
        function formatPrice(price) {
            return new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'HTG'
            }).format(price);
        }
        
        function showNotification(message, type = 'success') {
            const notification = document.getElementById('notification');
            const messageElement = document.getElementById('notification-message');
            
            if (!notification || !messageElement) return;
            
            // Mettre à jour le message et le style
            messageElement.textContent = message;
            
            if (type === 'error') {
                notification.style.backgroundColor = '#EF4444';
            } else if (type === 'warning') {
                notification.style.backgroundColor = '#F59E0B';
            } else {
                notification.style.backgroundColor = '#10B981';
            }
            
            // Afficher la notification avec Anime.js
            const showAnim = anime({
                targets: notification,
                translateY: [-100, 0],
                duration: 300,
                easing: 'easeOutQuad'
            });
            
            // Cacher après 3 secondes
            setTimeout(() => {
                const hideAnim = anime({
                    targets: notification,
                    translateY: [0, -100],
                    duration: 300,
                    easing: 'easeInQuad'
                });
                animationInstances.push(hideAnim);
            }, 3000);
            
            animationInstances.push(showAnim);
        }
        
        function showLoadingState(containerId, isSkeleton = false) {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            if (isSkeleton) {
                return;
            }
            
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    <p class="mt-4 text-gray-600">Chargement...</p>
                </div>
            `;
        }
        
        function showEmptyState(containerId, message) {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-box-open text-5xl text-gray-300 mb-4"></i>
                    <p class="text-gray-600">${message}</p>
                </div>
            `;
        }
        
        function showErrorState(containerId, message) {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-exclamation-triangle text-5xl text-red-300 mb-4"></i>
                    <p class="text-gray-600">${message}</p>
                    <button onclick="loadInitialData()" class="mt-4 text-primary hover:underline">
                        Réessayer
                    </button>
                </div>
            `;
        }
        
        function subscribeToNewsletter(email) {
            if (!email || !email.includes('@')) {
                showNotification('Veuillez entrer un email valide', 'error');
                return;
            }
            
            console.log('Inscription newsletter:', email);
            
            showNotification('Merci pour votre inscription !');
            
            const form = document.getElementById('newsletter-form');
            if (form) {
                form.reset();
            }
        }
        
        // ============================================
        // EXPOSER LES FONCTIONS GLOBALES
        // ============================================
        
        window.removeFromCart = removeFromCart;
        window.loadInitialData = loadInitialData;

 // ===============================
// FULLSCREEN IMAGE SLIDER
// ===============================
let modalImages = [];
let modalIndex = 0;

const imageModal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalPrev = document.getElementById('modalPrev');
const modalNext = document.getElementById('modalNext');
const modalDots = document.getElementById('modalDots');
const closeBtn = imageModal.querySelector('.close-btn');

// OUVERTURE
function openImageModal(images, startIndex = 0) {
    modalImages = images;
    modalIndex = startIndex;

    imageModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    renderModal();
}

// FERMETURE
function closeImageModal() {
    imageModal.classList.add('hidden');
    modalImage.src = '';
    modalDots.innerHTML = '';
    document.body.style.overflow = '';
}

// AFFICHAGE
function renderModal() {
    modalImage.src = modalImages[modalIndex];

    modalPrev.style.display = modalImages.length > 1 ? 'block' : 'none';
    modalNext.style.display = modalImages.length > 1 ? 'block' : 'none';

    modalDots.innerHTML = '';
    modalImages.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = `w-3 h-3 rounded-full cursor-pointer ${
            i === modalIndex ? 'bg-white' : 'bg-white/40'
        }`;
        dot.onclick = () => {
            modalIndex = i;
            renderModal();
        };
        modalDots.appendChild(dot);
    });
}

// BOUTONS
modalPrev.onclick = () => {
    modalIndex = (modalIndex - 1 + modalImages.length) % modalImages.length;
    renderModal();
};

modalNext.onclick = () => {
    modalIndex = (modalIndex + 1) % modalImages.length;
    renderModal();
};

// FERMETURE EVENTS
closeBtn.onclick = closeImageModal;

imageModal.addEventListener('click', e => {
    if (e.target === imageModal) closeImageModal();
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeImageModal();
});

// SWIPE MOBILE
let startX = 0;
imageModal.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
});
imageModal.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (diff > 50) modalNext.onclick();
    if (diff < -50) modalPrev.onclick();
});

// EXPOSER
window.openImageModal = openImageModal;


   