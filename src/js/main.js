
const API_URL = 'https://api.hyperteknoloji.com.tr/products/list';


const API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJMb2dpblR5cGUiOiIxIiwiQ3VzdG9tZXJJRCI6IjU1NzI0IiwiRmlyc3ROYW1lIjoiRGVtbyIsIkxhc3ROYW1lIjoiSHlwZXIiLCJFbWFpbCI6ImRlbW9AaHlwZXIuY29tIiwiQ3VzdG9tZXJUeXBlSUQiOiIzMiIsIklzUmVzZWxsZXIiOiIwIiwiSXNBUEkiOiIxIiwiUmVmZXJhbmNlSUQiOiIiLCJSZWdpc3RlckRhdGUiOiIzLzI1LzIwMjUgMTowMDo0OCBQTSIsImV4cCI6MjA1NDEzNDExMCwiaXNzIjoiaHR0cHM6Ly9oeXBlcnRla25vbG9qaS5jb20iLCJhdWQiOiJodHRwczovL2h5cGVydGVrbm9sb2ppLmNvbSJ9.i_pqc2C5vSh1IegikQTkSxYk6MsjALLzp4g30KXqunM';


let currentPage = 1;
const itemsPerPage = 12; 


let cart = {
    items: [],
    total: 0
};

let allProducts = []; 
let filteredProducts = []; 


let currentSort = 'default';
let currentCategory = 'all';


function sortProducts(products, sortType) {
    let sortedProducts = [...products];
    
    switch (sortType) {
        case 'price-asc':
            sortedProducts.sort((a, b) => a.salePrice - b.salePrice);
            break;
        case 'price-desc':
            sortedProducts.sort((a, b) => b.salePrice - a.salePrice);
            break;
        case 'name-asc':
            sortedProducts.sort((a, b) => a.productName.localeCompare(b.productName));
            break;
        case 'name-desc':
            sortedProducts.sort((a, b) => b.productName.localeCompare(a.productName));
            break;
        default:
            
            break;
    }
    
    return sortedProducts;
}


function handleFilters() {
    const sortSelect = document.getElementById('sort-select');
    const categorySelect = document.getElementById('category-select');
    
    if (sortSelect && categorySelect) {
        currentSort = sortSelect.value;
        currentCategory = categorySelect.value;
        
       
        filteredProducts = currentCategory === 'all' 
            ? [...allProducts]
            : allProducts.filter(product => product.productCategoryID === parseInt(currentCategory));
        
        
        filteredProducts = sortProducts(filteredProducts, currentSort);
        
        
        currentPage = 1;
        updateProductDisplay();
    }
}


function createTokenInput() {
    const tokenContainer = document.getElementById('token-container');
    if (!tokenContainer) {
        console.error('Token container bulunamadı!');
        return;
    }

    const tokenDiv = document.createElement('div');
    tokenDiv.className = 'flex items-center space-x-2';
    tokenDiv.innerHTML = `
        <input type="text" 
               id="token-input" 
               class="border rounded-lg px-3 py-1 text-sm" 
               placeholder="Token giriniz">
        <button onclick="loadPage()" 
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Ürünleri Getir
        </button>
    `;
    tokenContainer.appendChild(tokenDiv);
}


async function fetchProducts() {
    try {
        console.log('API isteği gönderiliyor...');
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                page: 1,
                pageSize: 1000
            })
        });

        if (!response.ok) {
            throw new Error(`API yanıt vermedi: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Yanıtı:', data); 
        
        if (!data.success) {
            throw new Error('API başarısız yanıt döndü');
        }

        allProducts = Array.isArray(data.data) ? data.data : [];
        filteredProducts = [...allProducts];
        
        console.log('Ürünler yüklendi:', allProducts.length);
        return data;
    } catch (error) {
        console.error('Ürünler getirilirken hata oluştu:', error);
        throw error;
    }
}


function createProductCard(product) {
    if (!product) {
        throw new Error('Ürün verisi eksik');
    }

    const stockStatus = product.totalStock > 0 
        ? `<div class="flex items-center gap-1 text-green-500">
             <i class="fas fa-check-circle"></i>
             <span>Stokta (${product.totalStock})</span>
           </div>`
        : `<div class="flex items-center gap-1 text-red-500">
             <i class="fas fa-times-circle"></i>
             <span>Tükendi</span>
           </div>`;

    const platformBadges = (product.platformList || []).map(platformId => {
        const platformNames = {
            17: 'PC',
            24: 'Mobile'
        };
        return `<span class="text-xs px-3 py-1 font-medium">
                    <i class="fas ${platformId === 17 ? 'fa-desktop' : 'fa-mobile-alt'} mr-1"></i>
                    ${platformNames[platformId] || 'Platform'}
                </span>`;
    }).join('');

    const regionBadges = Object.entries(product.regionList || {}).map(([key, value]) => {
        return `<span class="text-xs px-3 py-1  font-medium">
                    <i class="fas fa-globe mr-1"></i>
                    ${value}
                </span>`;
    }).join('');

    return `
        <div class="bg-gradient-to-b from-[#2a2a2a] to-[#232323] rounded-xl overflow-hidden group relative shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <!-- Ürün Görseli -->
            <div class="aspect-w-16 aspect-h-9 relative overflow-hidden">
                <img src="${product.productData?.productMainImage || 'https://placehold.co/400x225/232323/666666?text=No+Image'}" 
                     alt="${product.productName}" 
                     class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                     onerror="this.src='https://placehold.co/400x225/232323/666666?text=No+Image'">
                
                <!-- Platform ve Region Badges -->
                <div class="absolute top-3 left-3 flex flex-wrap gap-2">
                    ${platformBadges}
                </div>
                <div class="absolute top-3 right-3 flex flex-wrap gap-2 justify-end">
                    ${regionBadges}
                </div>

                <!-- Hover Overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-4 p-6">
                    <button onclick="showProductDetails(${JSON.stringify(product).replace(/"/g, '&quot;')})" 
                            class="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-900 transition-all duration-300 w-full max-w-xs transform hover:scale-105 font-medium shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                        <i class="fas fa-search"></i>
                        Detayları Gör
                    </button>
                    <button onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})" 
                            class="bg-gradient-to-r from-green-600 to-green-800 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-900 transition-all duration-300 w-full max-w-xs transform hover:scale-105 font-medium shadow-lg shadow-green-500/20 flex items-center justify-center gap-2">
                        <i class="fas fa-shopping-cart"></i>
                        Satın Al
                    </button>
                </div>
            </div>

            <!-- Ürün Bilgileri -->
            <div class="p-6">
                <!-- Ürün Adı -->
                <h2 class="text-xl font-semibold text-gray-100 line-clamp-2 min-h-[3.5rem] mb-3 hover:text-blue-400 cursor-pointer transition-colors"
                    onclick="showProductDetails(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                    ${product.productName}
                </h2>

                <!-- Fiyat ve Stok Bilgisi -->
                <div class="flex items-end justify-between mb-4">
                    <div>
                        <p class="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">
                            ${product.salePrice.toFixed(2)} TL
                        </p>
                        ${product.marketPrice > product.salePrice ? `
                            <div class="flex items-center gap-2">
                                <p class="text-sm text-gray-500 line-through">${product.marketPrice.toFixed(2)} TL</p>
                                <span class="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                                    %${Math.round((1 - product.salePrice/product.marketPrice) * 100)} İndirim
                                </span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="text-sm font-medium">${stockStatus}</div>
                </div>

                <!-- Alım Limitleri -->
                <div class="mt-4 pt-4 border-t border-[#333] grid grid-cols-2 gap-4">
                    <div class="bg-[#2a2a2a] p-3 rounded-lg text-center">
                        <p class="text-sm text-gray-400 mb-1">Minimum</p>
                        <p class="text-lg font-semibold text-gray-200">${product.saleMinCount} adet</p>
                    </div>
                    <div class="bg-[#2a2a2a] p-3 rounded-lg text-center">
                        <p class="text-sm text-gray-400 mb-1">Maksimum</p>
                        <p class="text-lg font-semibold text-gray-200">${product.saleMaxCount} adet</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}


function showProductDetails(product) {
    const platformBadges = (product.platformList || []).map(platformId => {
        const platformNames = {
            17: 'PC',
            24: 'Mobile'
        };
        return `<span class="bg-gradient-to-r from-blue-600 to-blue-800 text-xs px-3 py-1 rounded-full font-medium shadow-lg shadow-blue-500/20">
                    <i class="fas ${platformId === 17 ? 'fa-desktop' : 'fa-mobile-alt'} mr-1"></i>
                    ${platformNames[platformId] || 'Platform'}
                </span>`;
    }).join('');

    const regionBadges = Object.entries(product.regionList || {}).map(([key, value]) => {
        return `<span class="bg-gradient-to-r from-purple-600 to-purple-800 text-xs px-3 py-1 rounded-full font-medium shadow-lg shadow-purple-500/20">
                    <i class="fas fa-globe mr-1"></i>
                    ${value}
                </span>`;
    }).join('');

    const modalHTML = `
        <div id="product-modal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div class="bg-gradient-to-b from-[#2a2a2a] to-[#232323] rounded-2xl w-full max-w-5xl mx-auto overflow-hidden shadow-2xl transform transition-all duration-300 modal-enter max-h-[90vh] flex flex-col">
                <!-- Modal Header -->
                <div class="flex justify-between items-start p-6 border-b border-[#333] shrink-0">
                    <h2 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                        ${product.productName}
                    </h2>
                    <button onclick="closeModal()" class="text-gray-400 hover:text-white transition-colors">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <!-- Modal Content - Scrollable Area -->
                <div class="p-6 overflow-y-auto custom-scrollbar">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- Sol Kolon -->
                        <div class="space-y-6">
                            <div class="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden shadow-2xl bg-[#1a1a1a]">
                                <img src="${product.productData?.productMainImage || 'https://placehold.co/800x450/232323/666666?text=No+Image'}" 
                                     alt="${product.productName}" 
                                     class="w-full h-full object-cover">
                            </div>
                            <div class="flex flex-wrap gap-2">
                                ${platformBadges}
                                ${regionBadges}
                            </div>
                            <div class="bg-[#1a1a1a] rounded-xl p-6">
                                <div class="flex items-center gap-2 text-sm text-gray-400">
                                    <i class="fas fa-shield-alt text-green-500"></i>
                                    <span>Güvenli Alışveriş</span>
                                </div>
                            </div>
                        </div>

                        <!-- Sağ Kolon -->
                        <div class="space-y-6">
                            <div class="bg-[#1a1a1a] rounded-xl p-6">
                                <div class="mb-4">
                                    <p class="text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">
                                        ${product.salePrice.toFixed(2)} TL
                                    </p>
                                    ${product.marketPrice > product.salePrice ? `
                                        <div class="flex items-center gap-2 mt-2">
                                            <p class="text-lg text-gray-500 line-through">${product.marketPrice.toFixed(2)} TL</p>
                                            <span class="text-sm bg-red-500/20 text-red-400 px-3 py-1 rounded-full">
                                                %${Math.round((1 - product.salePrice/product.marketPrice) * 100)} İndirim
                                            </span>
                                        </div>
                                    ` : ''}
                                </div>
                                
                                <div class="flex items-center gap-3">
                                    <div class="flex-1">
                                        <p class="text-lg ${product.totalStock > 0 ? 'text-green-500' : 'text-red-500'} flex items-center gap-2">
                                            <i class="fas ${product.totalStock > 0 ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                                            ${product.totalStock > 0 ? `Stokta ${product.totalStock} adet` : 'Stokta yok'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div class="bg-[#1a1a1a] rounded-xl p-6 space-y-4">
                                <h3 class="text-xl font-semibold text-gray-200 flex items-center gap-2">
                                    <i class="fas fa-shopping-basket text-blue-500"></i>
                                    Alım Bilgileri
                                </h3>
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="bg-[#2a2a2a] p-4 rounded-xl">
                                        <p class="text-sm text-gray-400 mb-1">Minimum Alım</p>
                                        <p class="text-2xl font-semibold text-gray-200">${product.buyMinCount} adet</p>
                                    </div>
                                    <div class="bg-[#2a2a2a] p-4 rounded-xl">
                                        <p class="text-sm text-gray-400 mb-1">Maksimum Alım</p>
                                        <p class="text-2xl font-semibold text-gray-200">${product.buyMaxCount} adet</p>
                                    </div>
                                </div>
                            </div>

                            ${product.productData?.productInfo ? `
                                <div class="bg-[#1a1a1a] rounded-xl p-6 space-y-4">
                                    <h3 class="text-xl font-semibold text-gray-200 flex items-center gap-2">
                                        <i class="fas fa-info-circle text-blue-500"></i>
                                        Teslimat Bilgisi
                                    </h3>
                                    <div class="bg-[#2a2a2a] p-4 rounded-xl">
                                        <p class="text-gray-300">${product.productData.productInfo}</p>
                                    </div>
                                </div>
                            ` : ''}

                            ${product.productRequire ? `
                                <div class="bg-[#1a1a1a] rounded-xl p-6 space-y-4">
                                    <h3 class="text-xl font-semibold text-gray-200 flex items-center gap-2">
                                        <i class="fas fa-clipboard-list text-blue-500"></i>
                                        Gerekli Bilgiler
                                    </h3>
                                    <div class="space-y-4">
                                        ${product.productRequire.map(req => `
                                            <div class="bg-[#2a2a2a] p-4 rounded-xl">
                                                <p class="text-sm font-medium text-gray-200 mb-3 flex items-center gap-2">
                                                    <i class="fas fa-angle-right text-blue-500"></i>
                                                    ${req.title}
                                                </p>
                                                ${req.type === 'text' ? `
                                                    <input type="text" 
                                                           placeholder="${req.placeholder}"
                                                           class="w-full px-4 py-3 bg-[#333] border border-[#444] rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300">
                                                ` : ''}
                                                ${req.type === 'image' && req.image_url ? `
                                                    <img src="${req.image_url}" alt="Requirement Image" class="rounded-xl">
                                                ` : ''}
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>

                <!-- Modal Footer - Sabit Alt Kısım -->
                <div class="p-6 border-t border-[#333] shrink-0">
                    <button onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})" 
                            class="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-6 py-4 rounded-xl transition-all duration-300 text-lg font-semibold shadow-lg shadow-blue-500/20 transform hover:scale-[1.02] flex items-center justify-center gap-2">
                        <i class="fas fa-shopping-cart"></i>
                        Satın Al
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}


function closeModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.remove();
    }
}


function updateProductDisplay() {
    console.log('Ürünler güncelleniyor...', filteredProducts.length);
    const productContainer = document.getElementById('product-container');
    
    if (!productContainer) {
        console.error('Product container bulunamadı!');
        return;
    }
    
    const existingPagination = document.getElementById('pagination-container');
    if (existingPagination) {
        existingPagination.remove();
    }
    
    if (filteredProducts.length === 0) {
        productContainer.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-xl text-gray-400">Ürün bulunamadı</p>
            </div>
        `;
        return;
    }
    
    try {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
        
        console.log(`Sayfa ${currentPage}: ${startIndex} - ${endIndex} arası ürünler gösteriliyor`);
        
        productContainer.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
        
        const productCards = paginatedProducts.map(product => {
            try {
                return createProductCard(product);
            } catch (error) {
                console.error('Ürün kartı oluşturulurken hata:', error, product);
                return `
                    <div class="bg-[#232323] rounded-lg p-4">
                        <p class="text-red-500">Ürün gösterilirken hata oluştu</p>
                    </div>
                `;
            }
        }).join('');
        
        productContainer.innerHTML = productCards;
        
        const paginationContainer = document.createElement('div');
        paginationContainer.id = 'pagination-container';
        paginationContainer.innerHTML = createPagination(filteredProducts.length);
        productContainer.parentNode.insertBefore(paginationContainer, productContainer.nextSibling);
        
    } catch (error) {
        console.error('Ürünler görüntülenirken hata:', error);
        productContainer.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-xl text-red-500">Ürünler görüntülenirken bir hata oluştu</p>
                <button onclick="updateProductDisplay()" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Tekrar Dene
                </button>
            </div>
        `;
    }
}


function createPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) {
        return '';
    }
    
    let pageButtons = '';
    
    pageButtons += `
        <button onclick="changePage(${currentPage - 1})" 
                class="px-3 py-2 rounded-lg bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a] transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}"
                ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 ||
            i === totalPages ||
            (i >= currentPage - 1 && i <= currentPage + 1)
        ) {
            pageButtons += `
                <button onclick="changePage(${i})" 
                        class="px-3 py-2 rounded-lg ${currentPage === i ? 'bg-blue-600 text-white' : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'} transition-colors">
                    ${i}
                </button>
            `;
        } else if (
            (i === currentPage - 2 && currentPage > 3) ||
            (i === currentPage + 2 && currentPage < totalPages - 2)
        ) {
            pageButtons += '<span class="px-2 text-gray-400">...</span>';
        }
    }
    
    pageButtons += `
        <button onclick="changePage(${currentPage + 1})" 
                class="px-3 py-2 rounded-lg bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a] transition-colors ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}"
                ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    return `
        <div class="flex flex-col items-center gap-4 mt-8 mb-8">
            <div class="flex items-center gap-2">
                ${pageButtons}
            </div>
            <div class="text-sm text-gray-400">
                Sayfa ${currentPage} / ${totalPages} (Toplam ${totalItems} ürün)
            </div>
        </div>
    `;
}


function changePage(newPage) {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    
    if (newPage < 1 || newPage > totalPages) {
        return;
    }
    
    currentPage = newPage;
    updateProductDisplay();
    
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}


async function loadPage() {
    const productContainer = document.getElementById('product-container');
    if (!productContainer) {
        console.error('Product container bulunamadı!');
        return;
    }

    productContainer.innerHTML = `
        <div class="col-span-full flex justify-center items-center py-12">
            <div class="loading"></div>
        </div>
    `;
    
    try {
        const response = await fetchProducts();
        console.log('Sayfa yükleniyor, ürün sayısı:', allProducts.length);
        
        if (!response || !response.success || !Array.isArray(response.data) || response.data.length === 0) {
            productContainer.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-xl text-gray-400">Ürün bulunamadı</p>
                </div>
            `;
            return;
        }

        updateCategoryOptions();

        currentPage = 1;
        updateProductDisplay();

    } catch (error) {
        console.error('Sayfa yüklenirken hata:', error);
        productContainer.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-xl text-red-500">Bir hata oluştu: ${error.message}</p>
                <button onclick="loadPage()" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Tekrar Dene
                </button>
            </div>
        `;
    }
}


function addToCart(product) {
    const existingItem = cart.items.find(item => item.productID === product.productID);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.items.push({
            productID: product.productID,
            name: product.productName,
            price: product.salePrice,
            quantity: 1,
            image: product.productData?.productMainImage
        });
    }
    
    updateCart();
    showCartNotification('Ürün sepete eklendi');
}


function removeFromCart(productID) {
    cart.items = cart.items.filter(item => item.productID !== productID);
    updateCart();
}


function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    
    cartCount.textContent = cart.items.reduce((total, item) => total + item.quantity, 0);
    cartCount.classList.add('cart-badge-update');
    setTimeout(() => cartCount.classList.remove('cart-badge-update'), 500);
    
    cartItems.innerHTML = cart.items.map(item => `
        <div class="flex items-center gap-2 cart-item-enter">
            <img src="${item.image || 'https://placehold.co/50x50'}" alt="${item.name}" class="w-12 h-12 object-cover rounded">
            <div class="flex-1">
                <h4 class="text-sm font-semibold">${item.name}</h4>
                <div class="flex items-center gap-2">
                    <div class="flex items-center gap-1">
                        <button onclick="updateQuantity(${item.productID}, ${item.quantity - 1})" 
                                class="text-gray-500 hover:text-blue-600">-</button>
                        <span class="text-sm">${item.quantity}</span>
                        <button onclick="updateQuantity(${item.productID}, ${item.quantity + 1})" 
                                class="text-gray-500 hover:text-blue-600">+</button>
                    </div>
                    <span class="text-sm text-gray-600">${item.price} TL</span>
                </div>
            </div>
            <button onclick="removeFromCart(${item.productID})" class="text-red-500 hover:text-red-600">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    cart.total = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    cartTotal.textContent = cart.total.toFixed(2) + ' TL';
}


function updateQuantity(productID, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(productID);
        return;
    }
    
    const item = cart.items.find(item => item.productID === productID);
    if (item) {
        item.quantity = newQuantity;
        updateCart();
    }
}


function toggleCart() {
    const cartDropdown = document.getElementById('cart-dropdown');
    cartDropdown.classList.toggle('hidden');
}


function showCartNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg modal-enter';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}


function goToCheckout() {
    if (cart.items.length === 0) {
        showCartNotification('Sepetiniz boş');
        return;
    }
    
    showCartNotification('Satın alınıyor...');
    toggleCart();
}


document.addEventListener('click', (e) => {
    const cartIcon = document.getElementById('cart-icon');
    const cartDropdown = document.getElementById('cart-dropdown');
    
    if (!cartIcon.contains(e.target) && !cartDropdown.contains(e.target)) {
        cartDropdown.classList.add('hidden');
    }
});


function searchProducts(query) {
    currentPage = 1;
    
    if (!query) {
        filteredProducts = [...allProducts];
        updateProductDisplay();
        return;
    }
    
    query = query.toLowerCase();
    filteredProducts = allProducts.filter(product => 
        product.productName.toLowerCase().includes(query) ||
        (product.productData?.productDescription || '').toLowerCase().includes(query)
    );
    
    updateProductDisplay();
    updateSearchResults(query);
}


function updateSearchResults(query) {
    const searchResults = document.getElementById('search-results');
    
    if (!query || filteredProducts.length === 0) {
        searchResults.classList.add('hidden');
        return;
    }
    
    const results = filteredProducts.slice(0, 5).map(product => `
        <div class="p-2 hover:bg-gray-50 cursor-pointer" onclick="selectSearchResult('${product.productName}')">
            <div class="flex items-center gap-2">
                <img src="${product.productData?.productMainImage || 'https://placehold.co/50x50'}" 
                     alt="${product.productName}" 
                     class="w-10 h-10 object-cover rounded">
                <div>
                    <div class="font-semibold">${product.productName}</div>
                    <div class="text-sm text-gray-600">${product.salePrice} TL</div>
                </div>
            </div>
        </div>
    `).join('');
    
    searchResults.innerHTML = results;
    searchResults.classList.remove('hidden');
}


function selectSearchResult(productName) {
    const searchInput = document.getElementById('search-input');
    searchInput.value = productName;
    searchProducts(productName);
    document.getElementById('search-results').classList.add('hidden');
}


function updateCategoryOptions() {
    const categorySelect = document.getElementById('category-select');
    if (!categorySelect) return;

    const uniqueCategories = [...new Set(allProducts.map(product => product.productCategoryID))];
    
    const options = uniqueCategories
        .sort((a, b) => a - b)
        .map(categoryId => `
            <option value="${categoryId}">Kategori ${categoryId}</option>
        `);
    
    categorySelect.innerHTML = `
        <option value="all">Tüm Kategoriler</option>
        ${options.join('')}
    `;
}


function showComingSoon(event) {
    event.preventDefault();
    const modal = document.getElementById('coming-soon-modal');
    modal.classList.remove('hidden');
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeComingSoon();
        }
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeComingSoon();
        }
    });
}

function closeComingSoon() {
    const modal = document.getElementById('coming-soon-modal');
    modal.classList.add('hidden');
}


document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #1a1a1a;
            border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #3a3a3a;
            border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #4a4a4a;
        }
    `;
    document.head.appendChild(style);

    console.log('Sayfa yüklendi, ürünler getiriliyor...');
    
    const sortSelect = document.getElementById('sort-select');
    const categorySelect = document.getElementById('category-select');
    
    if (sortSelect) {
        sortSelect.addEventListener('change', handleFilters);
    }
    
    if (categorySelect) {
        categorySelect.addEventListener('change', handleFilters);
    }

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        let debounceTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                searchProducts(e.target.value);
            }, 300);
        });
    }
    
    document.addEventListener('click', (e) => {
        const searchResults = document.getElementById('search-results');
        const searchInput = document.getElementById('search-input');
        
        if (searchResults && searchInput && !searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.add('hidden');
        }
    });
    
    loadPage();
});
