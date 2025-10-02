const initialState = {
    onlineUsers: [],
    messages: {},
    error: null,
    socketConnected: false
};

const messagesReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SOCKET_CONNECTED':
            return {
                ...state,
                socketConnected: action.payload,
                error: null
            };
        case 'SOCKET_ERROR':
            return {
                ...state,
                socketConnected: false,
                error: action.payload
            };
        case 'SET_ONLINE_USERS':
            return {
                ...state,
                onlineUsers: action.payload,
                error: null
            };
        case 'NEW_MESSAGE':
            const { conversationId } = action.payload;
            return {
                ...state,
                error: null,
                messages: {
                    ...state.messages,
                    [conversationId]: [
                        ...(state.messages[conversationId] || []),
                        action.payload
                    ]
                }
            };
        case 'MESSAGE_ERROR':
            return {
                ...state,
                error: action.payload
            };
        default:
            return state;
    }
};

export default messagesReducer;