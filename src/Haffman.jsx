import React, { useEffect, useState } from 'react';
import './Haffman.css'; // Убедитесь, что этот файл CSS содержит предоставленные стили

class Node {
    constructor(symbol, probability, count) {
        this.symbol = symbol;
        this.probability = probability;
        this.count = count;
        this.left = null;
        this.right = null;
    }
}

class MinHeap {
    constructor() {
        this.heap = [];
    }

    insert(node) {
        this.heap.push(node);
        this.bubbleUp(this.heap.length - 1);
    }

    extractMin() {
        if (this.heap.length === 1) return this.heap.pop();
        const min = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.sinkDown(0);
        return min;
    }

    bubbleUp(index) {
        const element = this.heap[index];
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parent = this.heap[parentIndex];
            if (element.probability >= parent.probability) break;
            this.heap[parentIndex] = element;
            this.heap[index] = parent;
            index = parentIndex;
        }
    }

    sinkDown(index) {
        const length = this.heap.length;
        const element = this.heap[index];
        let parentIndex = index;

        while (true) {
            let leftChildIdx = 2 * parentIndex + 1;
            let rightChildIdx = 2 * parentIndex + 2;
            let leftChild, rightChild;
            let swap = null;

            if (leftChildIdx < length) {
                leftChild = this.heap[leftChildIdx];
                if (leftChild.probability < element.probability) {
                    swap = leftChildIdx;
                }
            }
            if (rightChildIdx < length) {
                rightChild = this.heap[rightChildIdx];
                if (
                    (swap === null && rightChild.probability < element.probability) ||
                    (swap !== null && rightChild.probability < leftChild.probability)
                ) {
                    swap = rightChildIdx;
                }
            }
            if (swap === null) break;
            this.heap[parentIndex] = this.heap[swap];
            this.heap[swap] = element;
            parentIndex = swap;
        }
    }
}

const buildHuffmanTree = (symbolCounts) => {
    const heap = new MinHeap();
    symbolCounts.forEach(sc => heap.insert(new Node(sc.symbol, sc.probability, sc.count)));

    while (heap.heap.length > 1) {
        const left = heap.extractMin();
        const right = heap.extractMin();
        const merged = new Node(null, left.probability + right.probability, left.count + right.count);
        merged.left = left;
        merged.right = right;
        heap.insert(merged);
    }

    return heap.extractMin();
};

const buildHuffmanCodes = (root) => {
    const codes = {};
    const buildCodesRecursive = (node, prefix) => {
        if (node.symbol !== null) {
            codes[node.symbol] = { code: prefix, probability: node.probability, count: node.count };
            return;
        }
        buildCodesRecursive(node.left, prefix + '0');
        buildCodesRecursive(node.right, prefix + '1');
    };

    buildCodesRecursive(root, '');
    return Object.entries(codes).map(([symbol, { code, probability, count }]) => ({ symbol, code, probability, count }));
};

const calculateEntropy = (symbolCounts) => {
    return symbolCounts.reduce((sum, sc) => sum - sc.probability * Math.log2(sc.probability), 0);
};

const calculateAverageCodeLength = (huffmanCodes) => {
    return huffmanCodes.reduce((sum, { probability, code }) => sum + probability * code.length, 0);
};

const HuffmanCoder = ({ tableData }) => {
    const [huffmanCodes, setHuffmanCodes] = useState(null);
    const [entropy, setEntropy] = useState(null);
    const [averageCodeLength, setAverageCodeLength] = useState(null);
    const [inputText, setInputText] = useState('');
    const [encodedMessage, setEncodedMessage] = useState('');
    const [binaryInput, setBinaryInput] = useState('');
    const [decodedMessage, setDecodedMessage] = useState('');

    useEffect(() => {
        if (tableData) {
            const root = buildHuffmanTree(tableData.symbolCounts);
            const codes = buildHuffmanCodes(root);
            setHuffmanCodes(codes);
            setEntropy(calculateEntropy(tableData.symbolCounts));
            setAverageCodeLength(calculateAverageCodeLength(codes));
        }
    }, [tableData]);

    const encodeMessage = (message, codes) => {
        return message.split('').map(char => {
            const code = codes.find(c => c.symbol === char)?.code;
            return code || '';
        }).join('');
    };

    const decodeMessage = (encodedMessage, codesMap) => {
        let decoded = '';
        let currentCode = '';
        const codes = Object.fromEntries(codesMap.map(({ symbol, code }) => [code, symbol]));
        for (let bit of encodedMessage) {
            currentCode += bit;
            if (codes[currentCode]) {
                decoded += codes[currentCode];
                currentCode = '';
            }
        }
        return decoded;
    };

    const handleInputChange = (event) => {
        setInputText(event.target.value);
    };

    const handleBinaryInputChange = (event) => {
        setBinaryInput(event.target.value);
    };

    const handleEncode = () => {
        if (huffmanCodes) {
            const encodedMessage = encodeMessage(inputText, huffmanCodes);
            setEncodedMessage(encodedMessage);
        }
    };

    const handleDecode = () => {
        if (huffmanCodes) {
            const decodedMessage = decodeMessage(binaryInput, huffmanCodes);
            setDecodedMessage(decodedMessage);
        }
    };

    return (
        <div>
            <h2>Кодирование Хаффмана</h2>
            {huffmanCodes && (
                <table>
                    <thead>
                        <tr>
                            <th>Символ</th>
                            <th>Число вхождений</th>
                            <th>Код</th>
                            <th>Вероятность</th>
                            <th>Количество символов в зашифрованном двоичном коде</th>
                        </tr>
                    </thead>
                    <tbody>
                        {huffmanCodes
                            .sort((a, b) => b.probability - a.probability) // Сортировка по вероятности в порядке убывания
                            .map((row, index) => (
                                <tr key={index}>
                                    <td>{row.symbol}</td>
                                    <td>{row.count}</td>
                                    <td>{row.code}</td>
                                    <td>{row.probability.toFixed(10)}</td>
                                    <td>{row.code.length}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            )}
            {entropy !== null && (
                <div>
                    <h3>Энтропия: {entropy.toFixed(4)}</h3>
                </div>
            )}
            {averageCodeLength !== null && (
                <div>
                    <h3>Среднее количество двоичных разрядов: {averageCodeLength.toFixed(4)}</h3>
                </div>
            )}
            <div className="input-container">
                <input type="text" id="input" required value={inputText} onChange={handleInputChange} />
                <label htmlFor="input" className="label">Введите текст</label>
                <div className="underline" />
            </div>
            <div className="button-container">
                <button onClick={handleEncode}>Закодировать</button>
            </div>
            {encodedMessage && (
                <div>
                    <h3>Закодированное сообщение</h3>
                    <p>{encodedMessage}</p>
                </div>
            )}
            <div className="input-container">
                <input type="text" id="binaryInput" required value={binaryInput} onChange={handleBinaryInputChange} />
                <label htmlFor="binaryInput" className="label">Введите код</label>
                <div className="underline" />
            </div>
            <div className="button-container">
                <button onClick={handleDecode}>Декодировать</button>
            </div>
            {decodedMessage && (
                <div>
                    <h3>Декодированное сообщение</h3>
                    <p>{decodedMessage}</p>
                </div>
            )}
        </div>
    );
};

export default HuffmanCoder;