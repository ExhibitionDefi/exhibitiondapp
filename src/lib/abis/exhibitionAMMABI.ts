// ============================================================
// ExhibitionAMM ABI
// ============================================================

export const exhibitionAMMABI = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_tradingFeeBps",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_protocolFeeBps",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "_feeRecipient",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "DeadlineExpired",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InsufficientLiquidity",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InsufficientLiquidity",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InvalidAddress",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InvalidAmount",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InvalidFeeConfiguration",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InvalidLockData",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InvalidRecipient",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InvalidTokenAddress",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InvalidTokenAddress",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "LiquidityIsLocked",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "NoFeesToCollect",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "PoolAlreadyExists",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "PoolDoesNotExist",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "ReentrancyGuardReentrantCall",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "SlippageTooHigh",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "TokenTransferFailed",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "Unauthorized",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "UnauthorizedPoolCreation",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "ZeroAddress",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "ZeroAmount",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "ZeroAmount",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "ZeroLiquidity",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "token0",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "token1",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "earningsA",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "earningsB",
                "type": "uint256"
            }
        ],
        "name": "EarningsRealized",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "oldAddress",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newAddress",
                "type": "address"
            }
        ],
        "name": "ExhibitionContractSet",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "tradingFee",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "protocolFee",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "feeRecipient",
                "type": "address"
            }
        ],
        "name": "FeeConfigUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "provider",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "tokenA",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "tokenB",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amountA",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amountB",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "liquidityMinted",
                "type": "uint256"
            }
        ],
        "name": "LiquidityAdded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "projectId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "tokenA",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "tokenB",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "projectOwner",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "lpAmount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "unlockBlock",
                "type": "uint256"
            }
        ],
        "name": "LiquidityLocked",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "provider",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "tokenA",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "tokenB",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amountA",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amountB",
                "type": "uint256"
            }
        ],
        "name": "LiquidityRemoved",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "projectId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "tokenA",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "tokenB",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "projectOwner",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "lpAmount",
                "type": "uint256"
            }
        ],
        "name": "LiquidityUnlocked",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "tokenA",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "tokenB",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "inceptionBlock",
                "type": "uint256"
            }
        ],
        "name": "PoolCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "token0",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "token1",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "lpBalance",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "feeDebt0",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "feeDebt1",
                "type": "uint256"
            }
        ],
        "name": "PositionUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "token0",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "token1",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount0",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount1",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            }
        ],
        "name": "ProtocolFeesCollected",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "token0",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "token1",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "reserve0",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "reserve1",
                "type": "uint256"
            }
        ],
        "name": "ReservesUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "tokenIn",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "tokenOut",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amountIn",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amountOut",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "tradingFee",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "protocolFee",
                "type": "uint256"
            }
        ],
        "name": "Swap",
        "type": "event"
    },
    {
        "stateMutability": "payable",
        "type": "fallback"
    },
    {
        "inputs": [],
        "name": "ExhTokenAddress",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "FEE_DENOMINATOR",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "MAX_PROTOCOL_FEE",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "MAX_TRADING_FEE",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "USDXADDRESS",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "accumulatedProtocolFeesToken0",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "accumulatedProtocolFeesToken1",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_tokenA",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_tokenB",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_amountADesired",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_amountBDesired",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_amountAMin",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_amountBMin",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "_to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_deadline",
                "type": "uint256"
            }
        ],
        "name": "addLiquidity",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amountA",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountB",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "liquidity",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_tokenA",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_tokenB",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_amountADesired",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_amountBDesired",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_amountAMin",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_amountBMin",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "_to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_deadline",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_projectId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_lockDuration",
                "type": "uint256"
            }
        ],
        "name": "addLiquidityWithLock",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amountA",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountB",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "liquidity",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "allPoolPairs",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amountIn",
                "type": "uint256"
            }
        ],
        "name": "calculateExpectedFees",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "tradingFee",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "protocolFee",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "lpFee",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_user",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_tokenA",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_tokenB",
                "type": "address"
            }
        ],
        "name": "calculateUnrealizedEarnings",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "pending0",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "pending1",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_tokenA",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_tokenB",
                "type": "address"
            }
        ],
        "name": "collectProtocolFees",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address[][]",
                "name": "_tokenPairs",
                "type": "address[][]"
            }
        ],
        "name": "collectProtocolFeesMultiple",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_projectId",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "_tokenA",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_tokenB",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_projectOwner",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_lpAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_lockDuration",
                "type": "uint256"
            }
        ],
        "name": "createLiquidityLock",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "cumulativeEarningsToken0",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "cumulativeEarningsToken1",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_tokenA",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_tokenB",
                "type": "address"
            }
        ],
        "name": "doesPoolExist",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "exNEXADDRESS",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "exhibitionContract",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "exhibitionLPTokens",
        "outputs": [
            {
                "internalType": "contract IExhibitionLPTokens",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "feeConfig",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "tradingFee",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "protocolFee",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "feeRecipient",
                "type": "address"
            },
            {
                "internalType": "bool",
                "name": "feesEnabled",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "tokenA",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "tokenB",
                "type": "address"
            }
        ],
        "name": "getAccumulatedProtocolFees",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "fees0",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "fees1",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getAllPoolPairs",
        "outputs": [
            {
                "internalType": "address[2][]",
                "name": "",
                "type": "address[2][]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_amountIn",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "_tokenIn",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_tokenOut",
                "type": "address"
            }
        ],
        "name": "getAmountOut",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amountOut",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_user",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_tokenA",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_tokenB",
                "type": "address"
            }
        ],
        "name": "getEarningsReport",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "settled0",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "settled1",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "pending0",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "pending1",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "total0",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "total1",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getFeeConfig",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "tradingFee",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "protocolFee",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "feeRecipient",
                "type": "address"
            },
            {
                "internalType": "bool",
                "name": "feesEnabled",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_tokenA",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_tokenB",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_user",
                "type": "address"
            }
        ],
        "name": "getLPBalance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_tokenA",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_tokenB",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "getLiquidityLock",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "projectId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "projectOwner",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "unlockBlock",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "lockedLPAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "isActive",
                        "type": "bool"
                    }
                ],
                "internalType": "struct LiquidityLock",
                "name": "lock",
                "type": "tuple"
            },
            {
                "internalType": "uint256",
                "name": "blocksUntilUnlock",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address[][]",
                "name": "_tokenPairs",
                "type": "address[][]"
            }
        ],
        "name": "getMultiplePoolInfo",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "tokenA",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "tokenB",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "reserveA",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "reserveB",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalLPSupply",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "kLast",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "inceptionBlock",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "accFeePerLP0",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "accFeePerLP1",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct LiquidityPool[]",
                "name": "pools",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_tokenA",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_tokenB",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_amountADesired",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_amountBDesired",
                "type": "uint256"
            }
        ],
        "name": "getOptimalLiquidityAmounts",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "optimalAmountA",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "optimalAmountB",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_tokenA",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_tokenB",
                "type": "address"
            }
        ],
        "name": "getPool",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "tokenA",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "tokenB",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "reserveA",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "reserveB",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalLPSupply",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "kLast",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "inceptionBlock",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "accFeePerLP0",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "accFeePerLP1",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct LiquidityPool",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getPoolCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_tokenA",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_tokenB",
                "type": "address"
            }
        ],
        "name": "getPoolStatistics",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "volume24h",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "tvl",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "utilization",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_offset",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_limit",
                "type": "uint256"
            }
        ],
        "name": "getPoolsPaginated",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "tokenAs",
                "type": "address[]"
            },
            {
                "internalType": "address[]",
                "name": "tokenBs",
                "type": "address[]"
            },
            {
                "internalType": "uint256",
                "name": "totalPools",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "hasMore",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_tokenA",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_tokenB",
                "type": "address"
            }
        ],
        "name": "getPrice",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_user",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_tokenA",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_tokenB",
                "type": "address"
            }
        ],
        "name": "getRealizedEarnings",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "settled0",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "settled1",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "pending0",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "pending1",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_tokenA",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_tokenB",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_lpAmount",
                "type": "uint256"
            }
        ],
        "name": "getRemoveLiquidityQuote",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amountA",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountB",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_tokenA",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_tokenB",
                "type": "address"
            }
        ],
        "name": "getReserves",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "reserveA",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "reserveB",
                "type": "uint256"
            },
            {
                "internalType": "uint32",
                "name": "blockNumberLast_",
                "type": "uint32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_tokenIn",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_tokenOut",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_amountIn",
                "type": "uint256"
            }
        ],
        "name": "getSlippageImpact",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "slippagePercentage",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_tokenA",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_tokenB",
                "type": "address"
            }
        ],
        "name": "getTWAP",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "twapPrice",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address[]",
                "name": "_tokens",
                "type": "address[]"
            }
        ],
        "name": "getTokensInfo",
        "outputs": [
            {
                "internalType": "string[]",
                "name": "symbols",
                "type": "string[]"
            },
            {
                "internalType": "uint8[]",
                "name": "decimals",
                "type": "uint8[]"
            },
            {
                "internalType": "uint256[]",
                "name": "totalSupplies",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "tokenA",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "tokenB",
                "type": "address"
            }
        ],
        "name": "getTotalFeesCollected",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "totalFees0",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "totalFees1",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_tokenA",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_tokenB",
                "type": "address"
            }
        ],
        "name": "getTotalLPSupply",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_user",
                "type": "address"
            },
            {
                "internalType": "address[][]",
                "name": "_tokenPairs",
                "type": "address[][]"
            }
        ],
        "name": "getUserBalancesForPools",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "balances",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_user",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_offset",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_limit",
                "type": "uint256"
            }
        ],
        "name": "getUserPortfolio",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "tokenAs",
                "type": "address[]"
            },
            {
                "internalType": "address[]",
                "name": "tokenBs",
                "type": "address[]"
            },
            {
                "internalType": "uint256[]",
                "name": "lpBalances",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256[]",
                "name": "sharePercentages",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256",
                "name": "totalPositions",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "hasMore",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_user",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_tokenA",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_tokenB",
                "type": "address"
            }
        ],
        "name": "getUserPosition",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "lpBalance",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "feeDebt0",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "feeDebt1",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct LPPosition",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_user",
                "type": "address"
            }
        ],
        "name": "getUserPositionCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "count",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_tokenA",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_tokenB",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "getWithdrawableLPAmount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_tokenA",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_tokenB",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "isLiquidityLocked",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "lastFeeUpdateBlock",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "liquidityLocks",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "projectId",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "projectOwner",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "unlockBlock",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "lockedLPAmount",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "isActive",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "liquidityPools",
        "outputs": [
            {
                "internalType": "address",
                "name": "tokenA",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "tokenB",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "reserveA",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "reserveB",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "totalLPSupply",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "kLast",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "inceptionBlock",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "accFeePerLP0",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "accFeePerLP1",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_tokenA",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_tokenB",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_lpAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_lockDurationBlocks",
                "type": "uint256"
            }
        ],
        "name": "lockLiquidity",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "lpPositions",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "lpBalance",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "feeDebt0",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "feeDebt1",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "poolExists",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "projectTokenPairs",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_tokenA",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_tokenB",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_lpAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_amountAMin",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_amountBMin",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "_to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_deadline",
                "type": "uint256"
            }
        ],
        "name": "removeLiquidity",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amountA",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountB",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_exNEXAddress",
                "type": "address"
            }
        ],
        "name": "setExNEXAddress",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_exhTokenAddress",
                "type": "address"
            }
        ],
        "name": "setExhTokenAddress",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_exhibitionContract",
                "type": "address"
            }
        ],
        "name": "setExhibitionContract",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_tradingFeeBps",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_protocolFeeBps",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "_feeRecipient",
                "type": "address"
            }
        ],
        "name": "setFeeConfig",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bool",
                "name": "_enabled",
                "type": "bool"
            }
        ],
        "name": "setFeesEnabled",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_lpTokensAddress",
                "type": "address"
            }
        ],
        "name": "setLPTokensAddress",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_USDXAddress",
                "type": "address"
            }
        ],
        "name": "setUSDXAddress",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_tokenIn",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_tokenOut",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_amountIn",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_minAmountOut",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "_to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_deadline",
                "type": "uint256"
            }
        ],
        "name": "swapTokenForToken",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amountOut",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "totalFeesCollected",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "totalFeesCollectedToken1",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "twapData",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "price0CumulativeLast",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "price1CumulativeLast",
                "type": "uint256"
            },
            {
                "internalType": "uint32",
                "name": "blockNumberLast",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "blocksAccumulated",
                "type": "uint32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_tokenA",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_tokenB",
                "type": "address"
            }
        ],
        "name": "unlockLiquidity",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "userHasPosition",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "userPoolTokensA",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "userPoolTokensB",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    }
] as const;