// =========================================================================
// --- CONSTANTS ---
// =========================================================================
const CORRECT_PASSWORD = '123';

// =========================================================================
// --- INDIVIDUAL CARD PULL AND FLIP LOGIC (Multi-Step Interaction) ---
// =========================================================================
function initializeCardInteractions() {
    document.querySelectorAll('.card-container').forEach(card => {
        // Main listener for the card to handle pull/flip/reset
        card.addEventListener('click', function(event) {
            event.stopPropagation();
            const inner = card.querySelector('.card-inner');
            const isPulled = card.classList.contains('is-pulled');
            const isFlipped = inner.classList.contains('is-flipped');

            if (!isPulled) {
                // Case A: Card is stacked -> PULL OUT
                document.querySelectorAll('.card-container').forEach(otherCard => {
                    if (otherCard !== card) {
                        otherCard.classList.remove('is-pulled');
                        otherCard.querySelector('.card-inner').classList.remove('is-flipped');
                    }
                });
                card.classList.add('is-pulled');
            } else if (isPulled && !isFlipped) {
                // Case B: Card is pulled -> FLIP
                inner.classList.add('is-flipped');
            } else if (isPulled && isFlipped) {
                // Case C: Card is flipped -> RESET
                card.classList.remove('is-pulled');
                inner.classList.remove('is-flipped');
            }
        });

        // --- NEW & IMPROVED SHARE FUNCTIONALITY ---

        // This is the old text/link sharing function, used as a fallback
        const shareLinkFallback = (platform) => {
            const frontImg = card.querySelector('.card-front img');
            const cardPageUrl = `${window.location.href.split('#')[0]}#${card.id}`;
            const message = `Check out this card I pulled!\n\n` +
                          `Card: ${frontImg.alt.replace(' Front', '')}\n\n` +
                          `View it here: ${cardPageUrl}`;

            if (platform === 'whatsapp') {
                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
            } else if (platform === 'mail') {
                const subject = "A Card from the Gallery";
                const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
                window.location.href = mailtoUrl;
            }
        };

        // This is the NEW function that tries to share both photos
        const shareCardPhoto = async (platform) => {
            const frontImg = card.querySelector('.card-front img');
            const backImg = card.querySelector('.card-back img'); 
            
            const cardTitle = `Card ${frontImg.alt.replace(' Front', '')}`;
            const shareText = "Check out this card from the gallery!";

            // Check if Web Share API is supported
            if (navigator.share && navigator.canShare) {
                try {
                    // Fetch both images concurrently
                    const [frontResponse, backResponse] = await Promise.all([
                        fetch(frontImg.src),
                        fetch(backImg.src)
                    ]);

                    const frontBlob = await frontResponse.blob();
                    const backBlob = await backResponse.blob();

                    // Create a File object for each image
                    const frontFile = new File([frontBlob], 'card-front.png', { type: frontBlob.type });
                    const backFile = new File([backBlob], 'card-back.png', { type: backBlob.type });
                    const filesArray = [frontFile, backFile];

                    // Check if the browser can share MULTIPLE files
                    if (navigator.canShare({ files: filesArray })) {
                        await navigator.share({
                            files: filesArray,
                            title: cardTitle,
                            text: shareText,
                        });
                        console.log('Successfully shared both images.');
                        return; // Exit if sharing was successful
                    } 
                    // FALLBACK 1: If multiple files aren't supported, try sharing just the front
                    else if (navigator.canShare({ files: [frontFile] })) {
                        console.warn('Could not share multiple files. Sharing only the front image.');
                        await navigator.share({
                            files: [frontFile],
                            title: cardTitle,
                            text: shareText,
                        });
                        console.log('Successfully shared front image.');
                        return; // Exit if sharing was successful
                    }

                } catch (error) {
                    if (error.name !== 'AbortError') {
                        console.error('Error sharing photo(s):', error);
                    } else {
                        console.log('Share cancelled by user.');
                        return;
                    }
                }
            }
            
            // FALLBACK 2: If Web Share isn't supported or failed, use the old link sharing method.
            console.log('Web Share API not supported or failed. Falling back to link sharing.');
            shareLinkFallback(platform);
        };
        
        // Add listeners to the buttons
        const whatsappBtn = card.querySelector('.share-whatsapp');
        const mailBtn = card.querySelector('.share-mail');

        whatsappBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            shareCardPhoto('whatsapp');
        });

        mailBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            shareCardPhoto('mail');
        });
    });
}

// =========================================================================
// --- PASSWORD PROTECTION & INITIALIZATION LOGIC ---
// =========================================================================
function checkPassword() {
    const inputElement = document.getElementById('password-input');
    const errorMessage = document.getElementById('error-message');
    const overlay = document.getElementById('password-overlay');
    const mainContent = document.getElementById('main-content');
    
    const userPassword = inputElement.value;

    if (userPassword === CORRECT_PASSWORD) {
        overlay.style.display = 'none';
        mainContent.style.display = 'grid';
        errorMessage.textContent = '';
        initializeCardInteractions();
    } else {
        errorMessage.textContent = 'Incorrect Password. Please try again.';
        inputElement.value = '';
    }
}

// =========================================================================
// --- DOM CONTENT GENERATION ---
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const columnNames = ['asha', 'harish', 'twisha', 'hrisha', 'papa', 'mammy'];
    const cardsPerColumn = 25;
    let globalCardIndex = 1;

    columnNames.forEach((name) => {
        const cardStackElement = document.querySelector(`#column-${name} .card-stack`);
        for (let i = 0; i < cardsPerColumn; i++) {
            const frontImageIndex = (globalCardIndex * 2) - 1; 
            const backImageIndex = globalCardIndex * 2; 

            const cardHTML = `
                <div class="card-container" id="card-${globalCardIndex}">
                    <div class="card-inner">
                        <div class="card-face card-front">
                            <img src="photo${frontImageIndex}.png" alt="Card ${globalCardIndex} Front">
                        </div>
                        <div class="card-face card-back">
                            <img src="photo${backImageIndex}.png" alt="Card ${globalCardIndex} Back">
                            <div class="share-buttons">
                                <button class="share-btn share-whatsapp">WhatsApp</button>
                                <button class="share-btn share-mail">Email</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            cardStackElement.insertAdjacentHTML('beforeend', cardHTML);
            globalCardIndex++;
        }
    });
});