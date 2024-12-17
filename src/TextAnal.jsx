// src/TextAnalyzer.jsx
import React, { useState, useEffect } from 'react';
import './Chast1.css';

const TextAnalyzer = ({ setTableData, setFileData, fileData }) => {
    const [file, setFile] = useState(null);
    const [text, setText] = useState('');
    const [localTableData, setLocalTableData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (fileData) {
            setFile(fileData.file);
            setText(fileData.content);
        }
    }, [fileData]);
//обработка файла
    const handleFileChange = (event) => {
        setError(null); //сбрасывание ткекущего состояния ошибки
        const file = event.target.files[0]; //извлекается первый файл из списка загруженных файлов
        setFile(file); //сохранение выбранного файла
        setFileData({ file, content: '' }); //сохраняется сам файл и пустая строка для его содержимого
        //обработка возможных ошибок
        try {
            const reader = new FileReader(); //асинхронное чтение файла
            reader.onload = (e) => {
                console.log('Text from file:', e.target.result); //выводится содержимое файла в консоль
                setText(e.target.result); //сохранение текста
                setFileData({ file, content: e.target.result });
            };
            reader.onerror = () => {
                setError('Ошибка при чтении файла');
            };
            reader.readAsText(file); //чтение текста
        } catch (err) {
            console.error('Error reading file:', err);
            setError('Ошибка при чтении файла');
        }
    };

    const analyzeText = () => {
        //проверка наличия текста
        if (!text) {
          setError('Текст не загружен');
          return;
        }

        const lowerCaseText = text.toLowerCase(); //преобразование текста в нижний регистр
        const symbols = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя0123456789.,:;-( '; //символы для дальнейшего анализа
        const validText = Array.from(lowerCaseText).filter(char => symbols.includes(char)).join(''); //оставляет в тексте только вышеупомянутые символы
        const totalCharacters = validText.length; //считает общее кол-во символов
        let totalProbability = 0;

        //создается массив символов и с помощью map проходит по ним
        const symbolCounts = Array.from(symbols).map((symbol) => {
          const count = (validText.split(symbol).length - 1); //кол-во вхождений символа в текст
          const probability = totalCharacters > 0 ? count / totalCharacters : 0; //вероятность = если всего символов > 0, то кол-во вхождений делится на общее кол-во символов
          totalProbability += probability;
          const information = probability > 0 ? -Math.log2(probability) : 0; //информация = если вероятность > 0, то вычисляется по формуле -log2(p), иначе 0
          return { symbol, count, probability, information };
        });

        //нормализование данных
        const normalizedSymbolCounts = symbolCounts.map((symbolCount) => {
          const normalizedProbability = totalCharacters > 0 ? symbolCount.count / totalCharacters : 0;
          return { ...symbolCount, normalizedProbability };
        });

        //повторное суммирование символов
        const totalSymbols = normalizedSymbolCounts.reduce((sum, symbol) => sum + symbol.count, 0);
        //вычисление энтропии
        const entropy = normalizedSymbolCounts.reduce((sum, symbol) => sum + symbol.normalizedProbability * symbol.information, 0); //сумма произведений нормализованной вероятности каждого символа на его информацию

        const comparisonData = {
          ASCII: {
            uncertainty: 8, 
            codeLength: 8,
            absoluteRedundancy: 8 - entropy, //абсолютная избыточность = разница между длиной кода (8 бит) и энтропией текста
            relativeRedundancy: (8 - entropy) / 8, //относительная избыточность = отношение абсолютной избыточности к длине кода
          },
          Hartley: {
            uncertainty: Math.log2(symbols.length), //неопределенность Хартли log2(кол-во символов)
            codeLength: Math.ceil(Math.log2(symbols.length)), //округляет значение uncertainty до ближайшего большего целого, указывая сколько бит потребуется для кодирования символа
            absoluteRedundancy: Math.ceil(Math.log2(symbols.length)) - entropy, //сколько лишней информации содержится в тексте (абсолютная избыточность)
            relativeRedundancy: (Math.ceil(Math.log2(symbols.length)) - entropy) / Math.ceil(Math.log2(symbols.length)), //показывает насколько эффективно используется пространство для хранения информации
          },
        };

        const data = { symbolCounts: normalizedSymbolCounts, totalSymbols, entropy, comparisonData, totalProbability }; //массив с данными о каждом символе
        setLocalTableData(data);
        setTableData(data);
    };

    return (
        <div>
            <div>
                <h1 className="Header">Анализ текста</h1>
                <div className="container">
                    <div className="folder">
                        <div className="front-side">
                            <div className="tip"></div>
                            <div className="cover"></div>
                        </div>
                        <div className="back-side cover"></div>
                    </div>
                    <label className="custom-file-upload">
                        <input className="title" type="file" accept=".txt" onChange={handleFileChange} />
                        Выберите файл
                    </label>
                </div>
            </div>
            {file && (
                <div className="button-container">
                    <button onClick={analyzeText}>Анализировать</button>
                </div>
            )}
            {error && <p className="error">{error}</p>}
            {localTableData && (
                <div>
                    <h2>Результаты анализа</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Символ</th>
                                <th>Код символа</th>
                                <th>Число вхождений</th>
                                <th>Вероятность</th>
                                <th>Информация</th>
                            </tr>
                        </thead>
                        <tbody>
                            {localTableData.symbolCounts.map((row, index) => (
                                <tr key={index}>
                                    <td>{row.symbol}</td>
                                    <td>{row.symbol.charCodeAt(0)}</td>
                                    <td>{row.count}</td>
                                    <td>{row.probability.toFixed(10)}</td>
                                    <td>{row.information.toFixed(4)}</td>
                                </tr>
                            ))}
                            <tr>
                                <td colSpan="3">Всего символов</td>
                                <td colSpan="2">{localTableData.totalSymbols}</td>
                            </tr>
                            <tr>
                                <td colSpan="3">Полная вероятность</td>
                                <td colSpan="2">{localTableData.totalProbability.toFixed(4)}</td>
                            </tr>
                            <tr>
                                <td colSpan="3">Энтропия источника</td>
                                <td colSpan="2">{localTableData.entropy.toFixed(4)}</td>
                            </tr>
                        </tbody>
                    </table>
                    <h3>Сравнительный анализ кодирования</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Метод кодирования</th>
                                <th>Неопределенность</th>
                                <th>Разрядность кода</th>
                                <th>Абсолютная избыточность</th>
                                <th>Относительная избыточность</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>ASCII</td>
                                <td>{localTableData.comparisonData.ASCII.uncertainty} бит</td>
                                <td>{localTableData.comparisonData.ASCII.codeLength} бит</td>
                                <td>{localTableData.comparisonData.ASCII.absoluteRedundancy.toFixed(4)}</td>
                                <td>{localTableData.comparisonData.ASCII.relativeRedundancy.toFixed(4)}</td>
                            </tr>
                            <tr>
                                <td>Хартли</td>
                                <td>{localTableData.comparisonData.Hartley.uncertainty.toFixed(4)}</td>
                                <td>{localTableData.comparisonData.Hartley.codeLength} бит</td>
                                <td>{localTableData.comparisonData.Hartley.absoluteRedundancy.toFixed(4)}</td>
                                <td>{localTableData.comparisonData.Hartley.relativeRedundancy.toFixed(4)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TextAnalyzer;
