// =========================================================================
// --- CONSTANTS ---
// =========================================================================
const CORRECT_PASSWORD = '123';

// =========================================================================
// --- INDIVIDUAL CARD PULL AND FLIP LOGIC (Multi-Step Interaction) ---
// =========================================================================
function initializeCardInteractions() {
    // Select all elements with the class 'card-container'
    document.querySelectorAll('.card-container').forEach(card => {
        card.addEventListener('click', function(event) {
            
            // Critical: Stop the click from bubbling up to any higher element
            event.stopPropagation();
            
            const inner = card.querySelector('.card-inner');
            
            // 1. Check current states
            const isPulled = card.classList.contains('is-pulled');
            const isFlipped = inner.classList.contains('is-flipped');

            if (!isPulled) {
                // Case A: Card is stacked -> PULL OUT (First click)
                
                // First, reset all other cards in the entire grid
                document.querySelectorAll('.card-container').forEach(otherCard => {
                    if (otherCard !== card) {
                        otherCard.classList.remove('is-pulled');
                        otherCard.querySelector('.card-inner').classList.remove('is-flipped');
                    }
                });
                
                // Pull the clicked card out
                card.classList.add('is-pulled');

            } else if (isPulled && !isFlipped) {
                // Case B: Card is pulled out -> FLIP (Second click)
                inner.classList.add('is-flipped');
                
            } else if (isPulled && isFlipped) {
                // Case C: Card is flipped -> RESET (Third click)
                card.classList.remove('is-pulled');
                inner.classList.remove('is-flipped');
            }
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
    
    const userPassword = inputElement.value;

    if (userPassword === CORRECT_PASSWORD) {
        // Correct password: hide the overlay
        overlay.style.display = 'none';
        errorMessage.textContent = '';
        
        // Initialize the card interactions (pull and flip)
        initializeCardInteractions(); 
    } else {
        // Wrong password: show error
        errorMessage.textContent = 'Incorrect Password. Please try again.';
        inputElement.value = '';
    }
}