
    // ============================================
    // GALERIE ARTISTIQUE - RESPONSIVE
    // ============================================
    
    let galleryImages = [];
    let currentMobileIndex = 0;
    let galleryDisplayCount = 8;
    
    // Charger les images depuis Firestore
    function loadGalleryImages() {
        console.log("Chargement de la galerie...");
        
        if (!db) {
            console.log('Firebase non initialisé, réessayant dans 1 seconde...');
            setTimeout(loadGalleryImages, 1000);
            return;
        }
        
        // Charger les produits qui sont dans le hero
        db.collection('products')
            .where('showInHero', '==', true)
            .limit(12)
            .get()
            .then(querySnapshot => {
                if (querySnapshot.empty) {
                    console.log('Aucun produit dans hero, chargement des populaires...');
                    return db.collection('products')
                        .where('isPopular', '==', true)
                        .limit(12)
                        .get();
                }
                return querySnapshot;
            })
            .then(querySnapshot => {
                if (querySnapshot.empty) {
                    console.log('Aucun produit populaire, chargement des derniers...');
                    return db.collection('products')
                        .orderBy('createdAt', 'desc')
                        .limit(12)
                        .get();
                }
                return querySnapshot;
            })
            .then(querySnapshot => {
                galleryImages = [];
                
                querySnapshot.forEach(doc => {
                    const product = { id: doc.id, ...doc.data() };
                    
                    // Utiliser les images multiples ou l'image principale
                    let images = [];
                    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
                        images = product.images;
                    } else if (product.imageName) {
                        images = [product.imageName];
                    }
                    
                    // Ajouter chaque image à la galerie
                    images.forEach(imageUrl => {
                        galleryImages.push({
                            id: product.id,
                            url: imageUrl,
                            name: product.name || 'Produit',
                            price: product.price || 0,
                            description: product.description || ''
                        });
                    });
                });
                
                console.log(`${galleryImages.length} images chargées pour la galerie`);
                
                if (galleryImages.length === 0) {
                    // Ajouter des images de démo si aucune image n'est disponible
                    galleryImages = getDemoImages();
                }
                
                // Limiter à 12 images maximum
                galleryImages = galleryImages.slice(0, 12);
                
                // Rendre les galeries pour chaque device
                renderMobileGallery();
                renderTabletGallery();
                renderDesktopGallery();
                
                // Activer les contrôles mobile
                activateMobileControls();
                
            })
            .catch(error => {
                console.error('Erreur lors du chargement de la galerie:', error);
                
                // En cas d'erreur, afficher des images de démo
                galleryImages = getDemoImages();
                
                renderMobileGallery();
                renderTabletGallery();
                renderDesktopGallery();
                activateMobileControls();
            });
    }
    
    // Images de démo pour le fallback
    function getDemoImages() {
        return [
            {
                id: 'demo1',
                url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&auto=format',
                name: 'Casque Audio Premium',
                price: '299',
                description: 'Qualité sonore exceptionnelle'
            },
            {
                id: 'demo2',
                url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&h=800&fit=crop&auto=format',
                name: 'Appareil Photo Pro',
                price: '899',
                description: 'Capturez vos plus beaux moments'
            },
            {
                id: 'demo3', 
                url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&h=800&fit=crop&auto=format',
                name: 'Montre Connectée',
                price: '249',
                description: 'Style et technologie'
            },
            {
                id: 'demo4',
                url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w-800&h=800&fit=crop&auto=format',
                name: 'Ordinateur Portable',
                price: '1299',
                description: 'Performance et mobilité'
            },
            {
                id: 'demo5',
                url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&h=800&fit=crop&auto=format',
                name: 'Chaussures Sport',
                price: '149',
                description: 'Confort et style'
            },
            {
                id: 'demo6',
                url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop&auto=format',
                name: 'Montre Élégante',
                price: '399',
                description: 'Élégance intemporelle'
            }
        ];
    }
    
    // Rendre la galerie mobile (1 image par ligne)
    function renderMobileGallery() {
        const container = document.getElementById('gallery-mobile');
        if (!container || galleryImages.length === 0) return;
        
        console.log("Rendu galerie mobile");
        
        // Tableau de classes clip-path
        const clipPathClasses = [
            'clip-diagonal-right', 'clip-diagonal-left', 'clip-trapeze',
            'clip-parallelogram', 'clip-hexagon', 'clip-chamfered',
            'clip-asymmetric', 'clip-angled', 'clip-circle',
            'clip-pentagon', 'clip-ellipse', 'clip-triangle', 'clip-star'
        ];
        
        // Vider le conteneur
        container.innerHTML = '';
        
        // Créer un item pour chaque image
        galleryImages.forEach((image, index) => {
            const clipClass = clipPathClasses[index % clipPathClasses.length];
            const animationClass = index % 2 === 0 ? 'animate-slideInRight' : 'animate-slideInLeft';
            
            const itemHTML = `
                <div class="gallery-item gallery-item-mobile ${clipClass} gallery-item-appear"
                     style="animation-delay: ${index * 0.1}s; opacity: 0;"
                     data-index="${index}">
                    <img src="${image.url}" 
                         alt="${image.name}"
                         loading="lazy"
                         onerror="this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&auto=format'"
                         class="w-full h-full">
                    
                  
                </div>
            `;
            
            container.innerHTML += itemHTML;
        });
        
        // Mettre à jour le compteur mobile
        updateMobileCounter();
        
        // Ajouter les événements de clic
        setTimeout(() => {
            container.querySelectorAll('.gallery-item').forEach(item => {
                item.addEventListener('click', function() {
                    const index = parseInt(this.getAttribute('data-index'));
                    showMobileSlide(index);
                });
            });
        }, 100);
    }
    
    // Rendre la galerie tablette (2 images par ligne)
    function renderTabletGallery() {
        const container = document.querySelector('#gallery-tablet .grid');
        if (!container || galleryImages.length === 0) return;
        
        console.log("Rendu galerie tablette");
        
        const clipPathClasses = [
            'clip-diagonal-right', 'clip-diagonal-left', 'clip-trapeze',
            'clip-parallelogram', 'clip-hexagon', 'clip-chamfered'
        ];
        
        container.innerHTML = '';
        
        galleryImages.forEach((image, index) => {
            const clipClass = clipPathClasses[index % clipPathClasses.length];
            
            const itemHTML = `
                <div class="gallery-item gallery-item-tablet ${clipClass} gallery-item-appear"
                     style="animation-delay: ${index * 0.1}s; opacity: 0;"
                     data-index="${index}">
                    <img src="${image.url}" 
                         alt="${image.name}"
                         loading="lazy"
                         onerror="this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop&auto=format'"
                         class="w-full h-full">
                
                </div>
            `;
            
            container.innerHTML += itemHTML;
        });
        
        // Ajouter les événements de clic
        setTimeout(() => {
            container.querySelectorAll('.gallery-item').forEach(item => {
                item.addEventListener('click', function() {
                    const index = parseInt(this.getAttribute('data-index'));
                    if (window.openImageModal) {
                        window.openImageModal([galleryImages[index].url], 0);
                    }
                });
            });
        }, 100);
    }
    
    // Rendre la galerie desktop (3-4 images par ligne)
    function renderDesktopGallery() {
        const container = document.querySelector('#gallery-desktop .grid');
        const loadMoreBtn = document.getElementById('load-more-gallery');
        if (!container || galleryImages.length === 0) return;
        
        console.log("Rendu galerie desktop");
        
        const clipPathClasses = [
            'clip-diagonal-right', 'clip-diagonal-left', 'clip-trapeze',
            'clip-parallelogram', 'clip-hexagon', 'clip-chamfered',
            'clip-asymmetric', 'clip-angled'
        ];
        
        // Limiter le nombre d'images affichées
        const imagesToShow = galleryImages.slice(0, galleryDisplayCount);
        
        container.innerHTML = '';
        
        imagesToShow.forEach((image, index) => {
            const clipClass = clipPathClasses[index % clipPathClasses.length];
            
            const itemHTML = `
                <div class="gallery-item gallery-item-desktop ${clipClass} gallery-item-appear"
                     style="animation-delay: ${index * 0.1}s; opacity: 0;"
                     data-index="${index}">
                    <img src="${image.url}" 
                         alt="${image.name}"
                         loading="lazy"
                         onerror="this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&auto=format'"
                         class="w-full h-full">
                    
                  
                </div>
            `;
            
            container.innerHTML += itemHTML;
        });
        
        // Gérer le bouton "Charger plus"
        if (loadMoreBtn) {
            if (galleryImages.length > galleryDisplayCount) {
                loadMoreBtn.classList.remove('hidden');
                anime({
                    targets: loadMoreBtn,
                    opacity: [0, 1],
                    duration: 600,
                    easing: 'easeOutQuad'
                });
                
                // Ajouter l'événement
                loadMoreBtn.onclick = function() {
                    galleryDisplayCount += 8;
                    renderDesktopGallery();
                    
                    if (galleryDisplayCount >= galleryImages.length) {
                        this.style.display = 'none';
                    }
                };
            } else {
                loadMoreBtn.style.display = 'none';
            }
        }
        
        // Ajouter les événements de clic
        setTimeout(() => {
            container.querySelectorAll('.gallery-item').forEach(item => {
                item.addEventListener('click', function() {
                    const index = parseInt(this.getAttribute('data-index'));
                    if (window.openImageModal) {
                        window.openImageModal([imagesToShow[index].url], 0);
                    }
                });
            });
        }, 100);
    }
    
    // Fonctions pour la navigation mobile
    function showMobileSlide(index) {
        if (index < 0 || index >= galleryImages.length) return;
        
        currentMobileIndex = index;
        
        // Animation de l'item actif
        const items = document.querySelectorAll('#gallery-mobile .gallery-item');
        items.forEach((item, i) => {
            if (i === index) {
                item.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    item.style.transform = 'scale(1)';
                }, 300);
            }
        });
        
        // Mettre à jour le compteur
        updateMobileCounter();
        
        // Faire défiler vers l'item
        const item = items[index];
        if (item) {
            item.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }
    
    function updateMobileCounter() {
        const currentEl = document.getElementById('current-slide');
        const totalEl = document.getElementById('total-slides');
        
        if (currentEl) currentEl.textContent = currentMobileIndex + 1;
        if (totalEl) totalEl.textContent = galleryImages.length;
    }
    
    function activateMobileControls() {
        const prevBtn = document.getElementById('gallery-mobile-prev');
        const nextBtn = document.getElementById('gallery-mobile-next');
        
        if (!prevBtn || !nextBtn) return;
        
        // Activer les boutons
        prevBtn.disabled = false;
        nextBtn.disabled = false;
        prevBtn.style.opacity = '1';
        nextBtn.style.opacity = '1';
        
        // Ajouter les événements
        prevBtn.addEventListener('click', () => {
            if (currentMobileIndex > 0) {
                showMobileSlide(currentMobileIndex - 1);
            }
        });
        
        nextBtn.addEventListener('click', () => {
            if (currentMobileIndex < galleryImages.length - 1) {
                showMobileSlide(currentMobileIndex + 1);
            }
        });
        
        // Swipe pour mobile
        let startX = 0;
        const galleryContainer = document.getElementById('gallery-mobile');
        
        if (galleryContainer) {
            galleryContainer.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
            });
            
            galleryContainer.addEventListener('touchend', (e) => {
                const endX = e.changedTouches[0].clientX;
                const diff = startX - endX;
                
                if (Math.abs(diff) > 50) { // Seuil de swipe
                    if (diff > 0 && currentMobileIndex < galleryImages.length - 1) {
                        // Swipe gauche
                        showMobileSlide(currentMobileIndex + 1);
                    } else if (diff < 0 && currentMobileIndex > 0) {
                        // Swipe droit
                        showMobileSlide(currentMobileIndex - 1);
                    }
                }
            });
        }
    }
    
    // Initialiser la galerie
    document.addEventListener('DOMContentLoaded', function() {
        console.log("Initialisation de la galerie...");
        
        // Charger la galerie après un délai
        setTimeout(() => {
            loadGalleryImages();
        }, 500);
        
        // Observer pour les animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const items = entry.target.querySelectorAll('.gallery-item-appear');
                    items.forEach((item, index) => {
                        setTimeout(() => {
                            item.style.animation = 'galleryItemAppear 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards';
                        }, index * 100);
                    });
                }
            });
        }, { threshold: 0.1 });
        
        const gallerySection = document.getElementById('gallery');
        if (gallerySection) {
            observer.observe(gallerySection);
        }
    });
    
    // Fonction pour mélanger un tableau
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
