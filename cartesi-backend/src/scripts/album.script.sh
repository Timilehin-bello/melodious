#!/bin/bash

# Set common variables
INPUT_BOX_ADDRESS="0x59b22D57D4f067708AB0c00552767405926dc768"
APPLICATION_ADDRESS="0xab7528bb862fb57e8a2bcd567a2e929a0be56a5e"
MNEMONIC="test test test test test test test test test test test junk"
RPC_URL="http://localhost:8545/"

# Function to send input using cast
send_input() {
    local input=$1
    local index=$2
    cast send \
        --mnemonic "$MNEMONIC" \
        --mnemonic-index $index \
        --rpc-url "$RPC_URL" \
        $INPUT_BOX_ADDRESS \
        "addInput(address,bytes)(bytes32)" $APPLICATION_ADDRESS $input
}

echo "Testing Album functions..."

# 1. Create a new Album
echo "1. Creating Album..."
CREATE_INPUT_1="7b226d6574686f64223a226372656174655f616c62756d222c2261726773223a7b227469746c65223a2254686520477265617420436f6d6d697373696f6e222c22696d61676555726c223a2268747470733a2f2f696d672e6672656570696b2e636f6d2f667265652d70686f746f2f6272696768742d6c696768742d6a657375732d63726f73735f32332d323135303937383833382e6a7067222c202267656e72654964223a20312c226c6162656c223a224d656c6f64696f7573222c2269735075626c6973686564223a747275652c2022747261636b73223a5b7b227469746c65223a22576f72746879206f66206d7920707261697365222c22696d61676555726c223a2268747470733a2f2f696d672e6672656570696b2e636f6d2f667265652d70686f746f2f6272696768742d6c696768742d6a657375732d63726f73735f32332d323135303937383833382e6a7067222c202267656e72654964223a20312c2022617564696f55726c223a2268747470733a2f2f7777772e6c6561726e696e67636f6e7461696e65722e636f6d2f77702d636f6e74656e742f75706c6f6164732f323032302f30322f4b616c696d62612e6d7033222c2269737263436f6465223a3132333435362c226475726174696f6e223a3334382c2269735075626c6973686564223a747275657d2c7b227469746c65223a2253696e67206f766572206d65222c22696d61676555726c223a2268747470733a2f2f696d672e6672656570696b2e636f6d2f667265652d70686f746f2f6272696768742d6c696768742d6a657375732d63726f73735f32332d323135303937383833382e6a7067222c2267656e72654964223a20302c22617564696f55726c223a2268747470733a2f2f7777772e6c6561726e696e67636f6e7461696e65722e636f6d2f77702d636f6e74656e742f75706c6f6164732f323032302f30322f4b616c696d62612e6d7033222c2269737263436f6465223a3132333435372c226475726174696f6e223a3334382c2269735075626c6973686564223a747275657d5d7d7d"
send_input $CREATE_INPUT_1 2
