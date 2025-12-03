// Initialize TON Connect
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://yourdomain.com/tonconnect-manifest.json',
    buttonRootId: 'ton-connect-button'
});

// DOM Elements
let farmGrid = document.getElementById('farm-grid');
let balanceEl = document.getElementById('balance');
let inviteProgress = document.getElementById('invite-progress');

// Initialize game
function initGame() {
    loadUserState();
    renderFarmGrid();
    updateUI();
    
    // Check for Telegram WebApp
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
        setupTelegramUser();
    }
}

// Render 3x3 farming grid
function renderFarmGrid() {
    farmGrid.innerHTML = '';
    
    for (let i = 0; i < 9; i++) {
        const plant = PLANTS[i];
        const slot = document.createElement('div');
        slot.className = 'farm-slot';
        slot.dataset.plantId = plant.id;
        
        // Check if plant is unlocked/planted
        const planted = userState.planted.find(p => p.id === plant.id);
        
        if (planted) {
            // Planted state
            const timeLeft = getTimeLeft(planted.plantedAt, plant.timeHours);
            
            slot.innerHTML = `
                <div class="plant-emoji">${plant.emoji}</div>
                <div class="plant-name">${plant.name}</div>
                ${timeLeft > 0 ? 
                    `<div class="timer">${formatTime(timeLeft)}</div>` :
                    `<div class="harvest-ready">READY!</div>`
                }
            `;
            
            slot.classList.add('planted');
            if (timeLeft <= 0) slot.classList.add('ready');
            
            slot.onclick = () => showPlantDetails(plant.id, true);
            
        } else {
            // Not planted - show lock/unlock state
            slot.innerHTML = `
                <div class="plant-emoji locked">${plant.emoji}</div>
                <div class="plant-name">${plant.name}</div>
                <div class="unlock-cond">${getUnlockText(plant)}</div>
            `;
            
            if (isPlantUnlocked(plant.id)) {
                slot.classList.add('unlocked');
                slot.onclick = () => showPlantDetails(plant.id, false);
            } else {
                slot.classList.add('locked');
                slot.onclick = () => showLockedMessage(plant);
            }
        }
        
        farmGrid.appendChild(slot);
    }
}

// Show plant details modal
function showPlantDetails(plantId, isPlanted) {
    const plant = PLANTS.find(p => p.id === plantId);
    const planted = userState.planted.find(p => p.id === plantId);
    
    let modalContent = '';
    
    if (isPlanted && planted) {
        const timeLeft = getTimeLeft(planted.plantedAt, plant.timeHours);
        
        modalContent = `
            <div class="plant-modal planted">
                <div class="plant-header">
                    <span class="plant-emoji-large">${plant.emoji}</span>
                    <h2>${plant.name}</h2>
                </div>
                
                <div class="plant-stats">
                    <div class="stat">
                        <span>Yield:</span>
                        <strong>${plant.reward} TON</strong>
                    </div>
                    <div class="stat">
                        <span>Cycle:</span>
                        <strong>${plant.timeHours}h</strong>
                    </div>
                </div>
                
                ${timeLeft > 0 ? 
                    `<div class="timer-card">
                        <h3>⏳ Growing...</h3>
                        <div class="countdown">${formatTime(timeLeft)}</div>
                        <p>Ready in: ${formatHours(timeLeft)}</p>
                    </div>` :
                    `<div class="harvest-card">
                        <h3>💰 Ready to Harvest!</h3>
                        <p>Collect ${plant.reward} TON</p>
                        <button class="harvest-btn" onclick="harvestPlant(${plantId})">
                            <i class="fas fa-money-bill-wave"></i> Harvest ${plant.reward} TON
                        </button>
                    </div>`
                }
                
                <div class="replant-section">
                    <p>After harvesting, you need to replant.</p>
                    <button class="buy-btn" onclick="buyPlant(${plantId})">
                        Replant - ${getCostText(plant)}
                    </button>
                </div>
            </div>
        `;
        
    } else {
        // Not planted yet
        modalContent = `
            <div class="plant-modal buy">
                <div class="plant-header">
                    <span class="plant-emoji-large">${plant.emoji}</span>
                    <h2>${plant.name}</h2>
                </div>
                
                <div class="plant-info">
                    <p>${plant.description}</p>
                    
                    <div class="reward-box">
                        <div class="reward-item">
                            <span>Cost:</span>
                            <strong class="cost">${getCostText(plant)}</strong>
                        </div>
                        <div class="reward-item">
                            <span>Daily Yield:</span>
                            <strong class="yield">${plant.reward} TON</strong>
                        </div>
                        <div class="reward-item">
                            <span>Cycle:</span>
                            <strong>${plant.timeHours} hours</strong>
                        </div>
                    </div>
                    
                    <div class="roi">
                        <i class="fas fa-chart-line"></i>
                        ROI: ${calculateROI(plant)}%
                    </div>
                </div>
                
                <div class="action-buttons">
                    ${plant.type === 'free' ? 
                        `<button class="free-btn" onclick="plantFree(${plantId})">
                            <i class="fas fa-seedling"></i> Plant Free
                        </button>` :
                    
                    plant.type === 'task' ?
                        `<button class="task-btn-modal" onclick="completeTaskForPlant(${plantId})">
                            <i class="fas fa-tasks"></i> Complete Tasks
                        </button>` :
                    
                    plant.type === 'paid' ?
                        `<button class="buy-btn" onclick="buyPlant(${plantId})">
                            <i class="fas fa-shopping-cart"></i> Buy for ${plant.cost} TON
                        </button>` :
                    ''}
                </div>
            </div>
        `;
    }
    
    document.getElementById('modal-content').innerHTML = modalContent;
    document.getElementById('plant-modal').classList.remove('hidden');
}

// Buy plant with TON (for paid plants)
async function buyPlant(plantId) {
    const plant = PLANTS.find(p => p.id === plantId);
    
    if (plant.type !== 'paid') return;
    
    if (!userState.walletAddress) {
        alert("Please connect your TON wallet first!");
        return;
    }
    
    showLoading();
    
    try {
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 600,
            messages: [
                {
                    address: ADMIN_WALLET,
                    amount: (plant.cost * 1000000000).toString(),
                    payload: `Buy ${plant.name} plant`
                }
            ]
        };
        
        const result = await tonConnectUI.sendTransaction(transaction);
        
        // Save transaction
        saveTransaction(userState.walletAddress, plant.cost, result.boc);
        
        // Add to planted
        plantSeed(plantId);
        
        // Send notification to admin
        notifyAdmin(userState.walletAddress, plant.cost, plant.name);
        
        alert(`✅ Successfully planted ${plant.name}! It will yield ${plant.reward} TON in 24 hours.`);
        
    } catch (error) {
        console.error("Transaction failed:", error);
        alert("❌ Transaction cancelled or failed");
    } finally {
        hideLoading();
    }
}

// Plant free plant (Tomato)
function plantFree(plantId) {
    if (plantId !== 1) return;
    
    plantSeed(plantId);
    alert("🌱 Tomato planted! Will yield 0.01 TON in 24h.");
}

// Complete tasks for Potato plant
function completeTaskForPlant(plantId) {
    if (plantId !== 2) return;
    
    if (userState.tasks.invites >= 5 && userState.tasks.sharedToGroup && userState.tasks.joinedChannel) {
        plantSeed(plantId);
        alert("🥔 Potato unlocked and planted! Will yield 0.03 TON in 24h.");
    } else {
        showTaskRequirements();
    }
}

// Plant seed function
function plantSeed(plantId) {
    const existingIndex = userState.planted.findIndex(p => p.id === plantId);
    
    if (existingIndex > -1) {
        userState.planted[existingIndex] = {
            id: plantId,
            plantedAt: Date.now()
        };
    } else {
        userState.planted.push({
            id: plantId,
            plantedAt: Date.now()
        });
    }
    
    saveUserState();
    renderFarmGrid();
    closeModal();
}

// Harvest plant
function harvestPlant(plantId) {
    const plant = PLANTS.find(p => p.id === plantId);
    const plantedIndex = userState.planted.findIndex(p => p.id === plantId);
    
    if (plantedIndex === -1) return;
    
    // Add to balance
    userState.balance += plant.reward;
    balanceEl.textContent = userState.balance.toFixed(3);
    
    // Remove from planted (needs to be replanted)
    userState.planted.splice(plantedIndex, 1);
    
    // Add to history
    userState.plantedHistory.push({
        id: plantId,
        harvestedAt: Date.now(),
        amount: plant.reward
    });
    
    saveUserState();
    renderFarmGrid();
    closeModal();
    
    alert(`💰 Harvested ${plant.reward} TON from ${plant.name}!`);
}

// Check if plant is unlocked
function isPlantUnlocked(plantId) {
    const plant = PLANTS.find(p => p.id === plantId);
    
    if (plant.type === 'free') return true;
    
    if (plant.type === 'task') {
        return userState.tasks.invites >= 5 && 
               userState.tasks.sharedToGroup && 
               userState.tasks.joinedChannel;
    }
    
    if (plant.type === 'paid') {
        // Paid plants are always "unlockable" - just need to pay
        return true;
    }
    
    return false;
}

// Get unlock text for plant
function getUnlockText(plant) {
    switch(plant.type) {
        case 'free': return 'FREE';
        case 'task': return 'DO TASK';
        case 'paid': return `${plant.cost} TON`;
        default: return 'LOCKED';
    }
}

// Get cost text
function getCostText(plant) {
    if (plant.type === 'free') return 'Free';
    if (plant.type === 'task') return 'Complete Tasks';
    return `${plant.cost} TON`;
}

// Calculate ROI
function calculateROI(plant) {
    if (plant.cost === 0) return 0;
    return (((plant.reward - plant.cost) / plant.cost) * 100).toFixed(1);
}

// Get time left for plant
function getTimeLeft(plantedAt, hours) {
    const elapsed = (Date.now() - plantedAt) / 1000 / 60 / 60; // hours
    const timeLeft = hours - elapsed;
    return timeLeft > 0 ? timeLeft : 0;
}

// Format time
function formatTime(hours) {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
}

function formatHours(hours) {
    return `${Math.ceil(hours)} hours`;
}

// Show locked message
function showLockedMessage(plant) {
    let message = '';
    
    switch(plant.type) {
        case 'task':
            message = `Unlock ${plant.name} by:\n• Joining our channel\n• Inviting 5 friends\n• Sharing to a group`;
            break;
        case 'paid':
            message = `Purchase ${plant.name} for ${plant.cost} TON\nDaily yield: ${plant.reward} TON`;
            break;
    }
    
    alert(`🔒 ${plant.name} is locked\n\n${message}`);
}

// Task completion functions
function joinChannel() {
    window.open('https://t.me/Planting_Ton', '_blank');
    userState.tasks.joinedChannel = true;
    saveUserState();
    alert('✅ Channel joined!');
}

function shareToGroup() {
    const shareText = `🌿 New Web3 Game: Plant TON\n\nFarm and earn TON coins with automated rewards!\n\nJoin now: ${window.location.href}?ref=${userState.refCode || 'direct'}`;
    
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.shareText(shareText);
    } else {
        navigator.clipboard.writeText(shareText);
        alert('Share text copied to clipboard!');
    }
    
    userState.tasks.sharedToGroup = true;
    saveUserState();
}

// Referral system
function generateRefCode() {
    if (!userState.refCode) {
        userState.refCode = 'REF' + Math.random().toString(36).substr(2, 8).toUpperCase();
        saveUserState();
    }
    
    const refLink = `${window.location.origin}${window.location.pathname}?ref=${userState.refCode}`;
    document.getElementById('ref-link').value = refLink;
    
    return refLink;
}

function copyRefLink() {
    const refLink = generateRefCode();
    navigator.clipboard.writeText(refLink);
    alert('Referral link copied!');
}

// Check URL for referral
function checkReferral() {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode && refCode !== userState.refCode) {
        // This is where you'd credit the referrer
        console.log(`User came from referral: ${refCode}`);
        // In a real app, you'd save this to your backend
    }
}

// Withdrawal function
function withdrawTON() {
    if (userState.balance < MIN_WITHDRAWAL) {
        alert(`Minimum withdrawal is ${MIN_WITHDRAWAL} TON`);
        return;
    }
    
    if (!userState.walletAddress) {
        alert("Connect your wallet to withdraw");
        return;
    }
    
    // Send withdrawal request to admin
    sendWithdrawalRequest(userState.walletAddress, userState.balance);
    
    alert(`Withdrawal request for ${userState.balance.toFixed(2)} TON sent to admin.\nYou will receive it within 24 hours.`);
    
    // Reset balance
    userState.balance = 0;
    saveUserState();
    updateUI();
}

// Send notification to admin (Telegram bot)
async function notifyAdmin(userAddress, amount, plantName) {
    const message = `🪴 NEW PLANT PURCHASE\n\n` +
                   `Address: ${userAddress}\n` +
                   `Plant: ${plantName}\n` +
                   `Amount: ${amount} TON\n` +
                   `Time: ${new Date().toLocaleString()}`;
    
    // Replace with your Telegram bot token and chat ID
    const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN';
    const TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID';
    
    try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
    } catch (error) {
        console.error('Failed to notify admin:', error);
    }
}

// Save transaction locally
function saveTransaction(address, amount, boc) {
    const transactions = JSON.parse(localStorage.getItem('ton_transactions') || '[]');
    transactions.push({
        address,
        amount,
        boc,
        timestamp: new Date().toISOString(),
        plant: PLANTS.find(p => p.cost === amount)?.name || 'Unknown'
    });
    localStorage.setItem('ton_transactions', JSON.stringify(transactions));
}

// Local storage functions
function saveUserState() {
    localStorage.setItem('plant_ton_user', JSON.stringify(userState));
}

function loadUserState() {
    const saved = localStorage.getItem('plant_ton_user');
    if (saved) {
        userState = JSON.parse(saved);
        balanceEl.textContent = userState.balance.toFixed(3);
        inviteProgress.textContent = `${userState.tasks.invites}/5`;
    }
}

// Update UI
function updateUI() {
    balanceEl.textContent = userState.balance.toFixed(3);
    inviteProgress.textContent = `${userState.tasks.invites}/5`;
    
    const plantedCount = userState.planted.length;
    document.getElementById('planted-count').textContent = plantedCount;
}

// Modal functions
function closeModal() {
    document.getElementById('plant-modal').classList.add('hidden');
}

function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

// Navigation
function showSection(section) {
    // Add your section switching logic here
    console.log(`Switch to ${section} section`);
}

// Initialize on load
window.onload = function() {
    initGame();
    checkReferral();
    generateRefCode();
    
    // Handle TON Connect status changes
    tonConnectUI.onStatusChange((wallet) => {
        if (wallet) {
            userState.walletAddress = wallet.account.address;
            document.getElementById('wallet-address').textContent = 
                `${wallet.account.address.slice(0, 6)}...${wallet.account.address.slice(-4)}`;
            document.getElementById('wallet-info').classList.remove('hidden');
            document.getElementById('ton-connect-button').style.display = 'none';
            saveUserState();
        }
    });
};

function disconnectWallet() {
    tonConnectUI.disconnect();
    userState.walletAddress = null;
    document.getElementById('wallet-info').classList.add('hidden');
    document.getElementById('ton-connect-button').style.display = 'block';
    saveUserState();
}