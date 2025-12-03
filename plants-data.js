// All plants data
const PLANTS = [
    {
        id: 1,
        name: "Tomato",
        emoji: "🍅",
        cost: 0,
        reward: 0.01,
        timeHours: 24,
        type: "free",
        description: "Basic plant, grows every 24h",
        unlockCondition: "Free",
        color: "#FF6B6B",
        image: "tomato.png"
    },
    {
        id: 2,
        name: "Potato",
        emoji: "🥔",
        cost: "task",
        reward: 0.03,
        timeHours: 24,
        type: "task",
        description: "Complete tasks to unlock",
        unlockCondition: "Invite 5 friends + Share to group",
        color: "#FFA726",
        image: "potato.png",
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
        reward: 1.1,
        timeHours: 24,
        type: "paid",
        description: "1 TON investment, 10% daily return",
        unlockCondition: "Pay 1 TON",
        color: "#FFD54F",
        image: "corn.png"
    },
    {
        id: 4,
        name: "TONato",
        emoji: "🍅",
        cost: 10,
        reward: 16,
        timeHours: 24,
        type: "paid",
        description: "10 TON investment, 60% daily return",
        unlockCondition: "Pay 10 TON",
        color: "#4FC3F7",
        image: "tonato.png"
    },
    {
        id: 5,
        name: "Pumpkin",
        emoji: "🎃",
        cost: 50,
        reward: 85,
        timeHours: 24,
        type: "paid",
        description: "50 TON investment, 70% daily return",
        unlockCondition: "Pay 50 TON",
        color: "#FF9800",
        image: "pumpkin.png"
    },
    {
        id: 6,
        name: "Lettuce",
        emoji: "🥬",
        cost: 100,
        reward: 200,
        timeHours: 24,
        type: "paid",
        description: "100 TON investment, 100% daily return",
        unlockCondition: "Pay 100 TON",
        color: "#81C784",
        image: "lettuce.png"
    },
    {
        id: 7,
        name: "Cocoa",
        emoji: "🍫",
        cost: 250,
        reward: 350,
        timeHours: 24,
        type: "paid",
        description: "250 TON investment, 40% daily return",
        unlockCondition: "Pay 250 TON",
        color: "#795548",
        image: "cocoa.png"
    },
    {
        id: 8,
        name: "Coconut",
        emoji: "🥥",
        cost: 500,
        reward: 1100,
        timeHours: 24,
        type: "paid",
        description: "500 TON investment, 120% daily return",
        unlockCondition: "Pay 500 TON",
        color: "#FFF176",
        image: "coconut.png"
    },
    {
        id: 9,
        name: "Dragon Fruit",
        emoji: "🐉",
        cost: 1000,
        reward: 2500,
        timeHours: 24,
        type: "paid",
        description: "1000 TON investment, 150% daily return",
        unlockCondition: "Pay 1000 TON",
        color: "#F06292",
        image: "dragon.png"
    }
];

// User game state
let userState = {
    balance: 0,
    planted: [],
    referrals: 0,
    tasks: {
        joinedChannel: false,
        sharedToGroup: false,
        invites: 0
    },
    walletAddress: null,
    plantedHistory: []
};

// Your TON wallet address for receiving payments
const ADMIN_WALLET = "YOUR_TON_WALLET_ADDRESS_HERE";
const MIN_WITHDRAWAL = 2; // Minimum 2 TON for withdrawal