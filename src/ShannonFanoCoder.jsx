import React, { useEffect, useState } from 'react';
import './Haffman.css';

// Класс для создания объектов, которые будут представлять узлы дерева
class Node {
    constructor(symbol, probability, count) {
        this.symbol = symbol;
        this.probability = probability;
        this.count = count;
        this.left = null;
        this.right = null;
    }
}

// Функция построения дерева Фано, принимает массив symbolCounts
const buildShannonFanoTree = (symbolCounts) => {
    //проверка базового случая (для остановки рекурсивной функции если делить на группы уже нечего)
    if (symbolCounts.length === 1) {
        return new Node(symbolCounts[0].symbol, symbolCounts[0].probability, symbolCounts[0].count);
    }

    // Сортировка по убыванию вероятностей
    symbolCounts.sort((a, b) => b.probability - a.probability);
    
    // Общая сумма вероятностей
    let total = symbolCounts.reduce((sum, sc) => sum + sc.probability, 0);
    //накопление вероятностей в левой группе
    let cumulativeProbability = 0;
    //индекс символа разделения
    let splitIndex = 0;
    //значение разницы будет гарантированно меньше
    let minDifference = Infinity;

    // Проверка всех возможных разделений
    for (let i = 0; i < symbolCounts.length - 1; i++) {
        //На каждой итерации добавляется вероятность текущего символа к cumulativeProbability
        cumulativeProbability += symbolCounts[i].probability;
        // текущая сумма вероятностей для левой группы
        const leftSum = cumulativeProbability;
        // сумма вероятностей для правой группы
        const rightSum = total - leftSum;
        //значение показывает насколько сбалансированы группы
        const difference = Math.abs(leftSum - rightSum);

        //если текущая разница меньше минимальной разницы, то обновляются значения minDifference и splitIndex
        if (difference < minDifference) {
            minDifference = difference;
            splitIndex = i;
        }
    }
//массив symbolCounts делится на на две группы 
    const leftGroup = symbolCounts.slice(0, splitIndex + 1); //leftGroup - символы от начала до splitIndex
    const rightGroup = symbolCounts.slice(splitIndex + 1); //rightGroup - символы с индексами от splitIndex+1 до конца массива
//для каждой из двух групп вызывается функция buildShannonFanoTree, которая строит поддеревья для левой и правой группы
    const leftNode = buildShannonFanoTree(leftGroup);
    const rightNode = buildShannonFanoTree(rightGroup);
    //создается корневой узел для текущей итерации
    const root = new Node(null, leftGroup.reduce((sum, sc) => sum + sc.probability, 0), leftGroup.length + rightGroup.length);
    root.left = leftNode;
    root.right = rightNode;

    return root;
};
//функция построения кодов Фано
const buildShannonFanoCodes = (root) => {
    const codes = {}; //массив для хранения кодов
    //вспомогательная функция которая проходит по дереву и создает коды для каждого символа
    const buildCodesRecursive = (node, prefix) => {
       //если узел не является листом
        if (node.symbol !== null) {
            codes[node.symbol] = { code: prefix, probability: node.probability, count: node.count };
            return;
        }
        buildCodesRecursive(node.left, prefix + '1'); //если левое поддерево то +0
        buildCodesRecursive(node.right, prefix + '0'); //если правое то +1
    };

    buildCodesRecursive(root, '');
    //массив объектов где каждый объект описывает символ и его соответствующий код
    return Object.entries(codes).map(([symbol, { code, probability, count }]) => ({ symbol, code, probability, count }));
};
//вычисляет энтропию для набора символов -p*log2(p)
const calculateEntropy = (symbolCounts) => {
    return symbolCounts.reduce((sum, sc) => sum - sc.probability * Math.log2(sc.probability), 0);
};
//вычисляет среднюю длину кода вероятность*длину кода
const calculateAverageCodeLength = (shannonFanoCodes) => {
    return shannonFanoCodes.reduce((sum, { probability, code }) => sum + probability * code.length, 0);
};

const ShannonFanoCoder = ({ tableData }) => {
    const [shannonFanoCodes, setShannonFanoCodes] = useState(null);
    const [entropy, setEntropy] = useState(null);
    const [averageCodeLength, setAverageCodeLength] = useState(null);
    const [inputText, setInputText] = useState('');
    const [encodedMessage, setEncodedMessage] = useState('');
    const [binaryInput, setBinaryInput] = useState('');
    const [decodedMessage, setDecodedMessage] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        if (tableData) {
            const root = buildShannonFanoTree(tableData.symbolCounts);
            const codes = buildShannonFanoCodes(root);
            setShannonFanoCodes(codes);
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
        if (shannonFanoCodes) {
            const encodedMessage = encodeMessage(inputText, shannonFanoCodes);
            setEncodedMessage(encodedMessage);
        } 
    };

    const handleDecode = () => {
        if (shannonFanoCodes) {
            const decodedMessage = decodeMessage(binaryInput, shannonFanoCodes);
            setDecodedMessage(decodedMessage);
        }
    };

    return (
        <div>
            <h2>Кодирование Шеннона-Фано</h2>
            {shannonFanoCodes && (
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
                        {shannonFanoCodes
                            .sort((a, b) => b.probability - a.probability)
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

export default ShannonFanoCoder;
