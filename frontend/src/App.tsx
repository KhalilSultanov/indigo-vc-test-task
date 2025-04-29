import {useState} from 'react';
import axios from 'axios';
import {motion, AnimatePresence} from 'framer-motion';

interface GameResult {
    url: string;
    success: boolean;
    data: GameData | null;
    error: string | null;
}

interface GameData {
    id: number;
    name: string;
    description: string;
    creatorName: string;
    playing: number;
    visits: number;
    maxPlayers: number;
    created: string;
    genre: string;
    iconUrl: string | null;
}

function App() {
    const [input, setInput] = useState('');
    const [results, setResults] = useState<GameResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [invalidLines, setInvalidLines] = useState<string[]>([]);

    const handleSubmit = async () => {
        if (isLoading) return;

        const urls = input
            .split('\n')
            .map((url) => url.trim())
            .filter((url) => url.length > 0);

        const robloxGameUrlRegex = /^https:\/\/www\.roblox\.com\/games\/\d+\/[\w\-]+$/;
        const invalids = urls.filter((url) => !robloxGameUrlRegex.test(url));
        setInvalidLines(invalids);

        if (invalids.length > 0) {
            return;
        }

        setIsLoading(true);
        try {
            const {data} = await axios.post<GameResult[]>('http://localhost:3000/games', {urls});
            setResults((prev) => {
                const used = new Set(prev.map((g) => g.url));
                return [...prev, ...data.filter((g) => !used.has(g.url))];
            });
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-gray-100 py-10 px-6">
            <div className="max-w-6xl mx-auto space-y-10">
                <h1 className="text-4xl font-bold text-center text-gray-800">🎮 Roblox Games Info</h1>

                <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-lg">
          <textarea
              className={`w-full h-40 resize-none p-4 text-base border ${
                  invalidLines.length > 0 ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 ${
                  invalidLines.length > 0 ? 'focus:ring-red-500' : 'focus:ring-blue-500'
              }`}
              placeholder="Вставьте ссылки на игры, по одной на строку..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
          />

                    <AnimatePresence>
                        {invalidLines.length > 0 && (
                            <motion.div
                                initial={{opacity: 0, y: 10}}
                                animate={{opacity: 1, y: 0}}
                                exit={{opacity: 0, y: 10}}
                                transition={{duration: 0.25}}
                                className="mt-2 p-4 rounded-lg bg-red-50 border border-red-300 text-sm text-red-800"
                            >
                                <div className="flex items-start gap-2 font-medium">
                                    <span>⚠️</span>
                                    <p>Некорректные ссылки:</p>
                                </div>
                                <ul className="list-disc list-inside mt-2 pl-6">
                                    {invalidLines.map((line, idx) => (
                                        <li key={idx} className="break-all">{line}</li>
                                    ))}
                                </ul>
                            </motion.div>
                        )}
                    </AnimatePresence>


                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className={`px-6 py-2 rounded-lg font-medium text-white shadow-md transition ${
                                isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {isLoading ? 'Загрузка...' : 'Отправить'}
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto max-h-[600px] rounded-lg border border-gray-200 shadow-sm">
                    <table className="w-full table-auto text-sm text-left bg-white rounded-b-lg">
                        <thead className="bg-blue-600 text-white sticky top-0 z-10">
                        <tr>
                            <th className="px-5 py-3 text-center">Иконка</th>
                            <th className="px-5 py-3 text-center">Название</th>
                            <th className="px-5 py-3 text-center">Автор</th>
                            <th className="px-5 py-3 text-center">Описание</th>
                            <th className="px-5 py-3 text-center">Онлайн</th>
                            <th className="px-5 py-3 text-center">Визиты</th>
                            <th className="px-5 py-3 text-center">Макс. игроков</th>
                            <th className="px-5 py-3 text-center">Создано</th>
                            <th className="px-5 py-3 text-center">Жанр</th>
                            <th className="px-5 py-3 text-center">Статус</th>
                        </tr>
                        </thead>
                        <tbody>
                        {results.map((g, i) => (
                            <tr key={i} className="border-t hover:bg-gray-100 transition-colors duration-150">
                                <td className="px-5 py-3">
                                    {g.data?.iconUrl ? (
                                        <img src={g.data.iconUrl} alt="" className="w-12 h-12 rounded"/>
                                    ) : (
                                        '-'
                                    )}
                                </td>
                                <td className="px-5 py-3 text-center">{g.data?.name || '-'}</td>
                                <td className="px-5 py-3 text-center">{g.data?.creatorName || '-'}</td>
                                <td className="px-5 py-3 text-center">{g.data?.description || '-'}</td>
                                <td className="px-5 py-3 text-center">{g.data?.playing ?? '-'}</td>
                                <td className="px-5 py-3 text-center">{g.data?.visits ?? '-'}</td>
                                <td className="px-5 py-3 text-center">{g.data?.maxPlayers ?? '-'}</td>
                                <td className="px-5 py-3 text-center">{g.data?.created ? new Date(g.data.created).toLocaleDateString() : '-'}</td>
                                <td className="px-5 py-3 text-center">{g.data?.genre || '-'}</td>
                                <td className="px-5 py-3 text-center">
                                    {g.success ? (
                                        <span className="text-green-500">✅</span>
                                    ) : (
                                        <span className="text-red-500">❌ {g.error}</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default App;
