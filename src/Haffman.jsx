import React, { useEffect, useState } from 'react';
import './Haffman.css'; 

//class - шаблон для создания объектов с определенными свойствами и методами
//Класс Node - узел дерева Хаффмана
class Node {
    //constructor вызывается автоматически, нужен для инициализации свойств объекта
    constructor(symbol, probability, count) { //каждый узел содержит символ, вероятность, кол-во вхождений
        this.symbol = symbol; //св-во symbol хранит символ, который будет ассоциирован с этим узлом
        this.probability = probability; //св-во probability хранит вероятность вхождения (символы с большей вероятностью располагаются ближе к корню)
        this.count = count; //св-во count хранит кол-во вхождений 
        this.left = null; //св-во left указывает на левый дочерний узел
        this.right = null; //правый дочерний узел
    }
}

//класс MinHeap реализует минимальную кучу (в минимальной куче элемент с наименьшим значение находится в корне дерева)
//св-ва мин кучи (MinHeap) - 1. корень(первый элемент массива) минимален 2. для любого элемента кучи - значение этого элемента всегда меньше или равно значениям его потомков
class MinHeap {
    constructor() {
        this.heap = []; //массив для хранения элементов кучи
    }
//метод insert добавляет новый элемент node в кучу
    insert(node) {
        this.heap.push(node); //новый элемент помещается в конец массива
        this.bubbleUp(this.heap.length - 1); //если добавленный элемент меньше родителя, то он перемещается в кучу
    }
//метод extractMin удаляет и возвращает минимальный элемент кучи
    extractMin() {
        //если в куче только один элемент -> с помощью pop() удаляем его и возвращаем
        if (this.heap.length === 1) return this.heap.pop(); //нужно от ошибок если уже нечего перемещать
        const min = this.heap[0]; //сохраняет минимальный элемент (корень кучи) в переменной min 
        this.heap[0] = this.heap.pop(); //мы заменяем удаляемый корень последним элементом, чтобы уменьшить размер кучи на один
        this.sinkDown(0); //после замены корня на посл. элемент нужно восстановить свойства кучи (перемещая новый корень вниз по дереву, пока он не займёт правильное место)
        return min; //доступ к минимальному удаленному элементу
    }
//метод bubbleUp будет перемещать элемент вверх по куче, чтобы восстановить её св-ва
//параметр index - индекс элемента, который необходимо перемещать
    bubbleUp(index) {
        const element = this.heap[index]; //сохранение перемещаемого элемента в переменной element
        //начало цикла пока индекс больше 0 (пока не корень), потому что нельзя перемещать корнемой элемент вверх
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2); //вычисление индекса родительского элемента для element
            const parent = this.heap[parentIndex]; //сохранение вычисленного родительского элемента в переменную parent
            //если вероятность вхождения element больше или равна вероятности parent (основное св-во кучи) -> выход из цикла
            if (element.probability >= parent.probability) break;
            this.heap[parentIndex] = element; //если св-во не соблюдено, то заменяем родительский элемент на текущий (перемещаем его вверх)
            this.heap[index] = parent; //заменяем текущий элемент на родительский и продолжаем его проверять с его новым родителем
            index = parentIndex; //для нового элемента новый индекс
        }
    }
//метод sinkDown будет перемещать элемент вниз по куче, для восстановления её св-ств
//параметр index - индекс элемента, который необходимо перемещать
    sinkDown(index) {
        const length = this.heap.length; //сохранение длинны массива в переменную length
        const element = this.heap[index]; //сохранение перемещаемого элемента в переменной element
        let parentIndex = index; //инициализирует переменную для отслеживания текущего индекса элемента в куче
//начало цикла пока не будет найдено подходящее место для элемента
        while (true) {
            let leftChildIdx = 2 * parentIndex + 1; //вычисление индекса левого потомка
            let rightChildIdx = 2 * parentIndex + 2; //вычисление индекса правого потомка
            let leftChild, rightChild;
            let swap = null; // в будущем swap будет хранить индекс потомка, с которым нужно поменять местами текущий элемент, если это необходимо
//проверка на существование левого потомка
            if (leftChildIdx < length) { //индекс левого потомка должен быть меньше длины кучи
                leftChild = this.heap[leftChildIdx];
                if (leftChild.probability < element.probability) { //в минимальной куче меньшие значения должны быть выше
                    swap = leftChildIdx;
                }
            }
//аналогичная проверка правого потомка
            if (rightChildIdx < length) {
                rightChild = this.heap[rightChildIdx];
                //если правый потомок меньше текущего элемента или меньшн, чем левый потомк, обновляем swap
                if (
                    (swap === null && rightChild.probability < element.probability) ||
                    (swap !== null && rightChild.probability < leftChild.probability)
                ) {
                    swap = rightChildIdx;
                }
            }
            //если swap не был обновлен -> выходим из цикла
            if (swap === null) break;
            this.heap[parentIndex] = this.heap[swap]; //меняет местами текущий элемент с элементом по индексу swap
            this.heap[swap] = element; 
            parentIndex = swap;
        }
    }
}


//функция buildHuffmanTree создает дерево Хаффмана на основе частот символов
//symbolCounts - массив с символом, его вероятностью и числом вхождений
const buildHuffmanTree = (symbolCounts) => {
    const heap = new MinHeap(); //создается минимальная куча для хранения узлов дерева Хаффмана
    symbolCounts.forEach(sc => heap.insert(new Node(sc.symbol, sc.probability, sc.count))); //все символы из массива добавляются в кучу как отдельные узлы (каждый символ становится "листом" дерева)
//пока в куче не останется один узел(корень)
    while (heap.heap.length > 1) {
        //извлекаются два узла с минимальной вероятностью
        const left = heap.extractMin(); 
        const right = heap.extractMin();
        //создается новый узел merged который объединяет эти два узла (его вероятность = сумме вероятностьй этих узлов, его число вхождений = сумме вхождений этих двух узлов)
        const merged = new Node(null, left.probability + right.probability, left.count + right.count);
        //новый узел становится родительсим для этих двух извлеченный узлов
        merged.left = left;
        merged.right = right;
        heap.insert(merged); //новый узел добавляется обратно в кучу
    }

    return heap.extractMin(); //результат возвращается в корень 
};

//функция buildHuffmanCodes генерирует коды Хаффмана для каждого символа на основе построенного дерева
//root - корень дерева
const buildHuffmanCodes = (root) => {
    const codes = {}; //в codes будут храниться коды каждого символа
    //вспомогательная функция, которая будет проходить по дереву и генерировать коды
    const buildCodesRecursive = (node, prefix) => {
        //если текущий узел является "листом" (его symbol не равен null)
        if (node.symbol !== null) {
            codes[node.symbol] = { code: prefix, probability: node.probability, count: node.count };
            return;
        }
        buildCodesRecursive(node.left, prefix + '0'); //при переходе на левый узел добавляется 0
        buildCodesRecursive(node.right, prefix + '1'); //при переходе на правый узел добавляется 1
    };

    buildCodesRecursive(root, ''); //начинается с корня дерева и пустого префикса
    //возвращается массив, где каждый объект содержит: символ, код, вероятность, частоту
    return Object.entries(codes).map(([symbol, { code, probability, count }]) => ({ symbol, code, probability, count }));
};
//вычисляет энтропию массива символов
const calculateEntropy = (symbolCounts) => {
    //reduce - для прохода по всем элементам массива и накапливания значения энтропии
    return symbolCounts.reduce((sum, sc) => sum - sc.probability * Math.log2(sc.probability), 0);
};
//вычисляет среднюю длину кода для символов
const calculateAverageCodeLength = (huffmanCodes) => {
    return huffmanCodes.reduce((sum, { probability, code }) => sum + probability * code.length, 0);
};

const HuffmanCoder = ({ tableData }) => {
    const [huffmanCodes, setHuffmanCodes] = useState(null); //таблица кодов Хаффмана
    const [entropy, setEntropy] = useState(null); //энтропия исходных данных
    const [averageCodeLength, setAverageCodeLength] = useState(null); //средняя длина кода в двоичном представлении
    const [inputText, setInputText] = useState(''); //текст для кодирования
    const [encodedMessage, setEncodedMessage] = useState(''); //закодированный текст
    const [binaryInput, setBinaryInput] = useState(''); //двоичный код для декодирования
    const [decodedMessage, setDecodedMessage] = useState(''); //декодированный текст

    //обрабатывается входных данных tableData
    useEffect(() => {
        if (tableData) {
            const root = buildHuffmanTree(tableData.symbolCounts); //строится дерево
            const codes = buildHuffmanCodes(root); //генерируются коды
            setHuffmanCodes(codes);
            setEntropy(calculateEntropy(tableData.symbolCounts)); //вычисление энтропии
            setAverageCodeLength(calculateAverageCodeLength(codes)); //вычисление средней длины кода
        }
    }, [tableData]);

    //функция для кодировки текста
    const encodeMessage = (message, codes) => {
        //split('') - разбивает строку на массив символов
        //map - проходит по каждому символу массива и применяет к нему функцию которая возвращает закодированное сообщение
        //codes.find(...) - ищет первый объект в массиве codes, у которого св-во symbol совпадает с текущим символом char из массива
        return message.split('').map(char => {
            const code = codes.find(c => c.symbol === char)?.code;
            return code || ''; //если символ найден -> возвращается его код; если не найден -> возвращается пустая строка
        }).join(''); //объединяет все элементы массива (коды) в одну строку без разделителей
    };

    const decodeMessage = (encodedMessage, codesMap) => {
        let decoded = ''; //переменная, которая будет хранить результат декодирования
        let currentCode = ''; //будет использоваться для хранения битов
                                       //преобразует массив объектов в массив пар [код, символ]
                //ключи - коды; значения - соотв. символы
        const codes = Object.fromEntries(codesMap.map(({ symbol, code }) => [code, symbol]));
        //цикл проходит по каждому биту в закодированном сообщении
        for (let bit of encodedMessage) {
            //каждый раз, когда добавляется новый бит, проверяется, не образует ли он код, соответствующий какому-либо символу
            currentCode += bit;
            //есть ли в codes код равный currentCode
            if (codes[currentCode]) {
                //если код найден добавляет соответствующий символ в строку decoded
                decoded += codes[currentCode];
                currentCode = ''; //сбрасывает currentCode, чтобы начать накапливать следующий код
            }
        }
        return decoded; //после завершения цикла возвр. декодированное сообщение
    };

    //обновление состояния для ввода текста
    const handleInputChange = (event) => {
        setInputText(event.target.value);
    };

    //обновление состояния для ввода двоичного текста
    const handleBinaryInputChange = (event) => {
        setBinaryInput(event.target.value);
    };

    //вызывает функцию кодирования текста и сохраняет результат в состоянии encodedMessage
    const handleEncode = () => {
        if (huffmanCodes) {
            const encodedMessage = encodeMessage(inputText, huffmanCodes);
            setEncodedMessage(encodedMessage);
        }
    };

    //вызывает функцию декодирования текста и сохраняет результат в состоянии decodedMessage
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