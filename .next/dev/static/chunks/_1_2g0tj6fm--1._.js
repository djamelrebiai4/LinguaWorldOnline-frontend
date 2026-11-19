(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/games/DerDieDasGame.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DerDieDasGame",
    ()=>DerDieDasGame
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/Button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/Badge.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
const GENDER_LABELS = {
    maskulin: {
        label: 'DER',
        color: 'text-blue-600'
    },
    feminin: {
        label: 'DIE',
        color: 'text-pink-600'
    },
    neutrum: {
        label: 'DAS',
        color: 'text-green-600'
    }
};
function DerDieDasGame() {
    _s();
    const [vocab, setVocab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [currentItem, setCurrentItem] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [score, setScore] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [streak, setStreak] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [timeLeft, setTimeLeft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(60);
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [messageType, setMessageType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [timerId, setTimerId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const loadVocab = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DerDieDasGame.useCallback[loadVocab]": async ()=>{
            setVocab([
                {
                    key: 'ambulance',
                    de: 'der Krankenwagen',
                    gender: 'maskulin',
                    ar: 'سيارة إسعاف',
                    world: 'City'
                },
                {
                    key: 'bank',
                    de: 'die Bank',
                    gender: 'feminin',
                    ar: 'بنك / مصرف',
                    world: 'City'
                },
                {
                    key: 'bicycle',
                    de: 'das Fahrrad',
                    gender: 'neutrum',
                    ar: 'دراجة هوائية',
                    world: 'City'
                },
                {
                    key: 'book',
                    de: 'das Buch',
                    gender: 'neutrum',
                    ar: 'كتاب',
                    world: 'Classroom'
                },
                {
                    key: 'pen',
                    de: 'der Kugelschreiber',
                    gender: 'maskulin',
                    ar: 'قلم حبر',
                    world: 'Classroom'
                }
            ]);
        }
    }["DerDieDasGame.useCallback[loadVocab]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DerDieDasGame.useEffect": ()=>{
            loadVocab();
        }
    }["DerDieDasGame.useEffect"], [
        loadVocab
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DerDieDasGame.useEffect": ()=>{
            if (vocab.length > 0 && !currentItem) {
                nextQuestion();
            }
        }
    }["DerDieDasGame.useEffect"], [
        vocab.length,
        currentItem
    ]);
    const nextQuestion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DerDieDasGame.useCallback[nextQuestion]": ()=>{
            if (vocab.length === 0) return;
            const randomItem = vocab[Math.floor(Math.random() * vocab.length)];
            setCurrentItem(randomItem);
            setMessage('');
            setMessageType(null);
        }
    }["DerDieDasGame.useCallback[nextQuestion]"], [
        vocab
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DerDieDasGame.useEffect": ()=>{
            if (timeLeft > 0 && !timerId) {
                const id = setInterval({
                    "DerDieDasGame.useEffect.id": ()=>{
                        setTimeLeft({
                            "DerDieDasGame.useEffect.id": (t)=>{
                                if (t <= 1) {
                                    clearInterval(id);
                                    setTimerId(null);
                                    setTimeLeft(0);
                                    return 0;
                                }
                                return t - 1;
                            }
                        }["DerDieDasGame.useEffect.id"]);
                    }
                }["DerDieDasGame.useEffect.id"], 1000);
                setTimerId(id);
            }
            return ({
                "DerDieDasGame.useEffect": ()=>{
                    if (timerId) clearInterval(timerId);
                }
            })["DerDieDasGame.useEffect"];
        }
    }["DerDieDasGame.useEffect"], [
        timeLeft,
        timerId
    ]);
    const handleAnswer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DerDieDasGame.useCallback[handleAnswer]": (chosenGender)=>{
            if (!currentItem) return;
            const isCorrect = currentItem.gender === chosenGender;
            if (isCorrect) {
                setStreak({
                    "DerDieDasGame.useCallback[handleAnswer]": (s)=>s + 1
                }["DerDieDasGame.useCallback[handleAnswer]"]);
                const addedXP = Math.round(12 * (1 + Math.min(streak, 4) * 0.45));
                setScore({
                    "DerDieDasGame.useCallback[handleAnswer]": (s)=>s + addedXP
                }["DerDieDasGame.useCallback[handleAnswer]"]);
                setTimeLeft({
                    "DerDieDasGame.useCallback[handleAnswer]": (t)=>Math.min(60, t + 1)
                }["DerDieDasGame.useCallback[handleAnswer]"]);
                setMessage(`Correct! +${addedXP} XP`);
                setMessageType('success');
            } else {
                setStreak(0);
                setTimeLeft({
                    "DerDieDasGame.useCallback[handleAnswer]": (t)=>Math.max(20, t - 5)
                }["DerDieDasGame.useCallback[handleAnswer]"]);
                setMessage(`Wrong. The correct article is ${GENDER_LABELS[currentItem.gender].label}.`);
                setMessageType('error');
            }
            if (isCorrect) {
                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["userApi"].addXP('temp-user-id', Math.round(12 * (1 + Math.min(streak, 4) * 0.45)), 'Der Die Das correct answer').catch({
                    "DerDieDasGame.useCallback[handleAnswer]": ()=>{}
                }["DerDieDasGame.useCallback[handleAnswer]"]);
            }
            setTimeout({
                "DerDieDasGame.useCallback[handleAnswer]": ()=>{
                    nextQuestion();
                }
            }["DerDieDasGame.useCallback[handleAnswer]"], 1500);
        }
    }["DerDieDasGame.useCallback[handleAnswer]"], [
        currentItem,
        streak,
        nextQuestion,
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["userApi"]
    ]);
    if (timeLeft <= 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-md mx-auto py-12",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-8 rounded-xl border border-slate-200 bg-white text-center shadow-lg",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-2xl font-bold text-slate-900 mb-4",
                        children: "Time's Up!"
                    }, void 0, false, {
                        fileName: "[project]/components/games/DerDieDasGame.tsx",
                        lineNumber: 109,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-slate-600 mb-6",
                        children: [
                            "Final Score: ",
                            score,
                            " XP (Streak: ",
                            streak,
                            ")"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/games/DerDieDasGame.tsx",
                        lineNumber: 110,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        onClick: ()=>{
                            setScore(0);
                            setStreak(0);
                            setTimeLeft(60);
                            setTimerId(null);
                            nextQuestion();
                        },
                        children: "Play Again"
                    }, void 0, false, {
                        fileName: "[project]/components/games/DerDieDasGame.tsx",
                        lineNumber: 113,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/games/DerDieDasGame.tsx",
                lineNumber: 108,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/games/DerDieDasGame.tsx",
            lineNumber: 107,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-md mx-auto py-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between items-start mb-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2 text-sm font-medium text-slate-600",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: [
                                "⏱️ ",
                                timeLeft,
                                "s"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/games/DerDieDasGame.tsx",
                            lineNumber: 129,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-slate-400",
                            children: "|"
                        }, void 0, false, {
                            fileName: "[project]/components/games/DerDieDasGame.tsx",
                            lineNumber: 130,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: [
                                "⭐ ",
                                score,
                                " XP"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/games/DerDieDasGame.tsx",
                            lineNumber: 131,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-slate-400",
                            children: "|"
                        }, void 0, false, {
                            fileName: "[project]/components/games/DerDieDasGame.tsx",
                            lineNumber: 132,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: [
                                "🔥 ",
                                streak
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/games/DerDieDasGame.tsx",
                            lineNumber: 133,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/games/DerDieDasGame.tsx",
                    lineNumber: 128,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/games/DerDieDasGame.tsx",
                lineNumber: 127,
                columnNumber: 7
            }, this),
            currentItem && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-8 rounded-xl border border-slate-200 bg-white shadow-sm text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-4xl font-bold text-slate-900 mb-2",
                        children: currentItem.de.replace(/^(der|die|das)\s+/i, '')
                    }, void 0, false, {
                        fileName: "[project]/components/games/DerDieDasGame.tsx",
                        lineNumber: 139,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-sm text-slate-500 mb-6",
                        children: currentItem.ar || currentItem.de
                    }, void 0, false, {
                        fileName: "[project]/components/games/DerDieDasGame.tsx",
                        lineNumber: 142,
                        columnNumber: 11
                    }, this),
                    message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `mb-6 p-3 rounded-lg text-sm font-medium ${messageType === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`,
                        children: message
                    }, void 0, false, {
                        fileName: "[project]/components/games/DerDieDasGame.tsx",
                        lineNumber: 147,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-3 gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                onClick: ()=>handleAnswer('maskulin'),
                                variant: "outline",
                                className: "text-blue-600 border-blue-200 hover:bg-blue-50",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                        variant: "default",
                                        className: "mr-2",
                                        children: "DER"
                                    }, void 0, false, {
                                        fileName: "[project]/components/games/DerDieDasGame.tsx",
                                        lineNumber: 162,
                                        columnNumber: 15
                                    }, this),
                                    "Masculine"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/games/DerDieDasGame.tsx",
                                lineNumber: 157,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                onClick: ()=>handleAnswer('feminin'),
                                variant: "outline",
                                className: "text-pink-600 border-pink-200 hover:bg-pink-50",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                        variant: "default",
                                        className: "mr-2",
                                        children: "DIE"
                                    }, void 0, false, {
                                        fileName: "[project]/components/games/DerDieDasGame.tsx",
                                        lineNumber: 170,
                                        columnNumber: 15
                                    }, this),
                                    "Feminine"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/games/DerDieDasGame.tsx",
                                lineNumber: 165,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                onClick: ()=>handleAnswer('neutrum'),
                                variant: "outline",
                                className: "text-green-600 border-green-200 hover:bg-green-50",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                        variant: "default",
                                        className: "mr-2",
                                        children: "DAS"
                                    }, void 0, false, {
                                        fileName: "[project]/components/games/DerDieDasGame.tsx",
                                        lineNumber: 178,
                                        columnNumber: 15
                                    }, this),
                                    "Neuter"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/games/DerDieDasGame.tsx",
                                lineNumber: 173,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/games/DerDieDasGame.tsx",
                        lineNumber: 156,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/games/DerDieDasGame.tsx",
                lineNumber: 138,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/games/DerDieDasGame.tsx",
        lineNumber: 126,
        columnNumber: 5
    }, this);
}
_s(DerDieDasGame, "J5AgsBZYF6PuaVmdiMxKyGLcqMc=");
_c = DerDieDasGame;
var _c;
__turbopack_context__.k.register(_c, "DerDieDasGame");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/Badge.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Badge",
    ()=>Badge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
function Badge({ children, className = '', variant = 'default' }) {
    const variants = {
        default: 'bg-slate-100 text-slate-700',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-amber-100 text-amber-700'
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`,
        children: children
    }, void 0, false, {
        fileName: "[project]/components/ui/Badge.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
_c = Badge;
var _c;
__turbopack_context__.k.register(_c, "Badge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/Button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
function Button({ children, className = '', variant = 'primary', ...props }) {
    const base = 'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-blue-500'
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        className: `${base} ${variants[variant]} ${className}`,
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/components/ui/Button.tsx",
        lineNumber: 21,
        columnNumber: 5
    }, this);
}
_c = Button;
var _c;
__turbopack_context__.k.register(_c, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "api",
    ()=>api,
    "chatApi",
    ()=>chatApi,
    "contentApi",
    ()=>contentApi,
    "userApi",
    ()=>userApi
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$env$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/env.ts [app-client] (ecmascript)");
;
let API_BASE;
function getApiBase() {
    if (!API_BASE) {
        API_BASE = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$env$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["env"].NEXT_PUBLIC_API_URL || '';
    }
    return API_BASE;
}
async function request(input, init) {
    const apiBase = getApiBase();
    const url = apiBase ? `${apiBase}${input}` : input;
    const res = await fetch(url, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...init?.headers || {}
        }
    });
    if (!res.ok) {
        const error = await res.json().catch(()=>({}));
        throw new Error(error.error || `Request failed with status ${res.status}`);
    }
    return res.json();
}
const api = {
    get: (path)=>request(path),
    post: (path, body)=>request(path, {
            method: 'POST',
            body: JSON.stringify(body)
        })
};
const contentApi = {
    getVocab: ()=>api.get('/content/vocab'),
    getQuests: ()=>api.get('/content/quests'),
    getQuestTasks: (id)=>api.get(`/content/quests/${id}/tasks`),
    getDialogue: (world)=>api.get(`/content/dialogues/${world}`),
    getConfig: ()=>api.get('/content/config')
};
const userApi = {
    getMe: ()=>api.get('/auth/me'),
    getProgress: ()=>api.get('/user/progress'),
    addXP: (userId, xp, reason)=>api.post('/user/progress/xp', {
            userId,
            xp,
            reason
        }),
    completeQuestTask: (userId, questId, taskKey)=>api.post('/user/progress/quest', {
            userId,
            questId,
            taskKey
        })
};
const chatApi = {
    sendMessage: (body)=>api.post('/chat', body)
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/env.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "env",
    ()=>env
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const env = {
    NEXT_PUBLIC_API_URL: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_URL || ''
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_1_2g0tj6fm--1._.js.map