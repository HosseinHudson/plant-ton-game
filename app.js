// Initialize TON Connect
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://hosseinhudson.github.io/plant-ton-game/tonconnect-manifest.json',
    buttonRootId: 'ton-connect-button'
});

// Plant data - EXACTLY like your images
const PLANTS = [
    {
        id: 1,
        name: "Tomato",
        emoji: "🍅",
        cost: 0,
        reward: 0.001,
        timeHours: 23,
        type: "free",
        buttonText: "Free",
        level: "LVI"
    },
    {
        id: 2,
        name: "Potato",
        emoji: "🥔",
        cost: "task",
        reward: 0.005,
        timeHours: 23,
        type: "task",
        buttonText: "Do Task",
        level: "LV2",
        task: {
            invitesRequired: 5,
            shareToGroup: true,
            joinChannel: true
        }
    },
    {
        id: 3,
        name: "Corn",
        emoji: "🌽",
        cost: 1,
        reward: 1.06,
        timeHours: 23,
        type: "paid",
        buttonText: "1 TON",
        level: "LV3"
    },
    {
        id: 4,
        name: "TONato",
        emoji: "🍅",
        cost: 10,
        reward: 16,
        timeHours: 23,
        type: "paid",
        buttonText: "10 TON",
        level: "LV4"
    },
    {
        id: 5,
        name: "Pumpkin",
        emoji: "🎃",
        cost: 50,
        reward: 85,
        timeHours: 23,
        type: "paid",
        buttonText: "50 TON",
        level: "LV5"
    },
    {
        id: 6,
        name: "Lettuce",
        emoji: "🥬",
        cost: 100,
        reward: 200,
        timeHours: 23,
        type: "paid",
        buttonText: "100 TON",
        level: "LV6"
    },
    {
        id: 7,
        name: "Cocoa",
        emoji: "🍫",
        cost: 250,
        reward: 350,
        timeHours: 23,
        type: "paid",
        buttonText: "250 TON",
        level: "LV7"
    },
    {
        id: 8,
        name: "Coconut",
        emoji: "🥥",
        cost: 500,
        reward: 1100,
        timeHours: 23,
        type: "paid",
        buttonText: "500 TON",
        level: "LV8"
    },
    {
        id: 9,
        name: "Dragon Fruit",
        emoji: "🐉",
        cost: 1000,
        reward: 2500,
        timeHours: 23,
        type: "paid",
        buttonText: "1000 TON",
        level: "LV9"
    }
];

// User state
let userState = {
    balance: 0.042,
    planted: [],
    tasks: {
        joinedChannel: false,
        sharedToGroup: false,
        invites: 0
    },
    walletConnected: false
};

// Your wallet address
const ADMIN_WALLET = "UQABC123YOUR_WALLET_ADDRESS";

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadPlants();
    updateBalance();
    
    // TON Connect events
    tonConnectUI.onStatusChange((wallet) => {
        if (wallet) {
            userState.walletConnected = true;
            document.getElementById('wallet-address').textContent = 
                wallet.account.address.slice(0, 8) + '...' + wallet.account.address.slice(-6);
            document.getElementById('wallet-info').style.display = 'block';
            document.getElementById('ton-connect-button').style.display = 'none';
        }
    });
});

// Load plants to grid
function loadPlants() {
    const grid = document.getElementById('plants-grid');
    grid.innerHTML = '';
    
    PLANTS.forEach(plant => {
        const card = document.createElement('div');
        card.className = 'plant-card';
        card.onclick = () => showPlantModal(plant);
        
        card.innerHTML = `
            <div class="plant-emoji">${plant.emoji}</div>
            <div class="plant-name">${plant.name}</div>
            <div class="plant-yield">Yield: ${plant.reward} TON</div>
            <div class="plant-cycle">Growth cycle: ${plant.timeHours}h</div>
            <button class="plant-action ${getButtonClass(plant)}" onclick="event.stopPropagation(); handlePlantAction(${plant.id})">
                ${plant.buttonText}
            </button>
        `;
        
        grid.appendChild(card);
    });
}

// Show plant modal
function showPlantModal(plant) {
    document.getElementById('modal-plant-name').textContent = plant.name;
    
    let modalContent = '';
    
    if (plant.type === 'free') {
        modalContent = `
            <div style="text-align: center;">
                <div style="font-size: 60px; margin: 20px 0;">${plant.emoji}</div>
                <div style="font-size: 24px; font-weight: bold; margin: 10px 0;">${plant.name}</div>
                <div style="color: #a0aec0; margin-bottom: 30px;">${plant.level}</div>
                
                <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 15px; margin: 20px 0;">
                    <div style="font-size: 18px; margin-bottom: 10px;">Yield: ${plant.reward} TON</div>
                    <div style="color: #a0aec0;">Growth cycle: ${plant.timeHours}h</div>
                </div>
                
                <button class="free-btn" style="width: 100%; padding: 15px; border-radius: 12px; border: none; font-size: 18px; font-weight: bold; cursor: pointer;" onclick="plantFree(${plant.id})">
                    Free
                </button>
            </div>
        `;
    }
    else if (plant.type === 'task') {
        modalContent = `
            <div style="text-align: center;">
                <div style="font-size: 60px; margin: 20px 0;">${plant.emoji}</div>
                <div style="font-size: 24px; font-weight: bold; margin: 10px 0;">${plant.name}</div>
                <div style="color: #a0aec0; margin-bottom: 30px;">${plant.level}</div>
                
                <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 15px; margin: 20px 0;">
                    <div style="font-size: 18px; margin-bottom: 10px;">Yield: ${plant.reward} TON</div>
                    <div style="color: #a0aec0;">Growth cycle: ${plant.timeHours}h</div>
                </div>
                
                <button class="task-btn" style="width: 100%; padding: 15px; border-radius: 12px; border: none; font-size: 18px; font-weight: bold; cursor: pointer;" onclick="showTaskModal()">
                    Do Task
                </button>
            </div>
        `;
    }
    else if (plant.type === 'paid') {
        modalContent = `
            <div style="text-align: center;">
                <div style="font-size: 60px; margin: 20px 0;">${plant.emoji}</div>
                <div style="font-size: 24px; font-weight: bold; margin: 10px 0;">${plant.name}</div>
                <div style="color: #a0aec0; margin-bottom: 30px;">${plant.level}</div>
                
                <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 15px; margin: 20px 0;">
                    <div style="font-size: 18px; margin-bottom: 10px;">Yield: ${plant.reward} TON</div>
                    <div style="color: #a0aec0;">Growth cycle: ${plant.timeHours}h</div>
                    <div style="margin-top: 10px; color: #00ff88;">Cost: ${plant.cost} TON</div>
                </div>
                
                <button class="pay-btn" style="width: 100%; padding: 15px; border-radius: 12px; border: none; font-size: 18px; font-weight: bold; cursor: pointer;" onclick="buyPlant(${plant.id})">
                    ${plant.cost} TON
                </button>
            </div>
        `;
    }
    
    document.getElementById('modal-content').innerHTML = modalContent;
    document.getElementById('plant-modal').style.display = 'flex';
}

// Handle plant action
function handlePlantAction(plantId) {
    const plant = PLANTS.find(p => p.id === plantId);
    showPlantModal(plant);
}

// Get button class
function getButtonClass(plant) {
    switch(plant.type) {
        case 'free': return 'free-btn';
        case 'task': return 'task-btn';
        case 'paid': return 'pay-btn';
        default: return '';
    }
}

// Plant free plant
function plantFree(plantId) {
    if (plantId !== 1) return;
    
    showLoading();
    setTimeout(() => {
        userState.balance += 0.001;
        updateBalance();
        hideLoading();
        closeModal();
        alert('Tomato planted! Will yield 0.001 TON in 23h.');
    }, 1000);
}

// Show task modal
function showTaskModal() {
    document.getElementById('plant-modal').style.display = 'none';
    document.getElementById('task-modal').style.display = 'flex';
}

// Join channel
function joinChannel() {
    window.open('https://t.me/Planting_Ton', '_blank');
    userState.tasks.joinedChannel = true;
    alert('Channel joined!');
}

// Share to group
function shareToGroup() {
    const shareText = `🌿 New Web3 Game: Plant TON\n\nFarm and earn TON coins!\n\nJoin now: https://t.me/your_bot`;
    
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.shareText(shareText);
    } else {
        navigator.clipboard.writeText(shareText);
        alert('Share text copied!');
    }
    
    userState.tasks.sharedToGroup = true;
}

// Buy plant with TON
async function buyPlant(plantId) {
    const plant = PLANTS.find(p => p.id === plantId);
    
    if (!userState.walletConnected) {
        alert('Please connect your TON wallet first!');
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
        
        // Success
        setTimeout(() => {
            userState.balance += plant.reward;
            updateBalance();
            hideLoading();
            closeModal();
            alert(`✅ ${plant.name} purchased! Will yield ${plant.reward} TON in 23h.`);
        }, 2000);
        
    } catch (error) {
        hideLoading();
        alert('Transaction cancelled or failed.');
    }
}

// Update balance display
function updateBalance() {
    document.getElementById('balance').textContent = userState.balance.toFixed(3);
}

// Show loading
function showLoading() {
    document.getElementById('loading').style.display = 'flex';
}

// Hide loading
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

// Close modal
function closeModal() {
    document.getElementById('plant-modal').style.display = 'none';
    document.getElementById('task-modal').style.display = 'none';
}

// Disconnect wallet
function disconnectWallet() {
    tonConnectUI.disconnect();
    userState.walletConnected = false;
    document.getElementById('wallet-info').style.display = 'none';
    document.getElementById('ton-connect-button').style.display = 'block';
}

// Show section (bottom nav)
function showSection(section) {
    // Remove active class from all buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Here you would load different sections
    alert(`${section} section will be loaded`);
        }
