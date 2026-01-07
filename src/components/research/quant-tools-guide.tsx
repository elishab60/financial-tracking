"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    BookOpen,
    ChevronDown,
    LineChart,
    Activity,
    BarChart2,
    Zap,
    Target,
    TrendingUp,
    Calculator
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ToolExplanation {
    id: string
    name: string
    icon: React.ReactNode
    shortDesc: string
    explanation: string
    formula: string
    interpretation: string[]
    usage: string
}

const QUANT_TOOLS: ToolExplanation[] = [
    {
        id: "linear-regression",
        name: "Régression Linéaire",
        icon: <LineChart className="w-5 h-5" />,
        shortDesc: "Prédiction de tendance basée sur les données historiques",
        explanation: `La régression linéaire est une méthode statistique qui modélise la relation entre le temps (variable indépendante) et le prix (variable dépendante). Elle trouve la "meilleure" ligne droite qui passe à travers les points de données historiques.

Cette méthode suppose que le prix suit une tendance linéaire sur la période analysée. La pente de la ligne indique si la tendance est haussière (positive) ou baissière (négative).`,
        formula: `y = ax + b

où:
• y = prix prédit
• x = temps (jours)
• a = pente (slope) = Σ(xi - x̄)(yi - ȳ) / Σ(xi - x̄)²
• b = ordonnée à l'origine = ȳ - a × x̄

R² (coefficient de détermination):
R² = 1 - (SSres / SStot)
• SSres = Σ(yi - ŷi)² (somme des carrés des résidus)
• SStot = Σ(yi - ȳ)² (somme totale des carrés)`,
        interpretation: [
            "R² proche de 1 (>70%) → La tendance est fiable",
            "R² entre 40-70% → Tendance modérément fiable",
            "R² < 40% → Tendance peu fiable, le prix est volatile",
            "Pente positive → Tendance haussière",
            "Pente négative → Tendance baissière"
        ],
        usage: "Utilisée pour prédire le prix à court terme (7 jours) en prolongeant la tendance actuelle. Plus efficace sur les marchés en tendance que sur les marchés latéraux."
    },
    {
        id: "rsi",
        name: "RSI (Relative Strength Index)",
        icon: <Activity className="w-5 h-5" />,
        shortDesc: "Indicateur de momentum mesurant la force des mouvements",
        explanation: `Le RSI (Indice de Force Relative) est un oscillateur de momentum développé par J. Welles Wilder. Il mesure la vitesse et l'amplitude des mouvements de prix récents pour évaluer si un actif est suracheté ou survendu.

L'indicateur oscille entre 0 et 100. Les zones extrêmes (>70 ou <30) signalent un possible retournement de tendance.`,
        formula: `RSI = 100 - (100 / (1 + RS))

où:
• RS (Relative Strength) = Moyenne des gains / Moyenne des pertes
• Période standard = 14 jours

Calcul des moyennes (EMA):
• Gain moyen = (Gain moyen précédent × 13 + Gain actuel) / 14
• Perte moyenne = (Perte moyenne précédente × 13 + Perte actuelle) / 14`,
        interpretation: [
            "RSI > 70 → Zone de surachat, possible correction baissière",
            "RSI < 30 → Zone de survente, possible rebond haussier",
            "RSI = 50 → Équilibre entre acheteurs et vendeurs",
            "Divergence haussière → Prix baisse mais RSI monte = signal d'achat",
            "Divergence baissière → Prix monte mais RSI baisse = signal de vente"
        ],
        usage: "Idéal pour identifier les points d'entrée/sortie. Fonctionne mieux en combinaison avec d'autres indicateurs et dans les marchés sans tendance forte."
    },
    {
        id: "macd",
        name: "MACD (Moving Average Convergence Divergence)",
        icon: <BarChart2 className="w-5 h-5" />,
        shortDesc: "Indicateur de tendance et momentum combiné",
        explanation: `Le MACD est un indicateur de suivi de tendance qui montre la relation entre deux moyennes mobiles exponentielles (EMA). Il aide à identifier les changements de direction, de force et de momentum d'une tendance.

Composé de trois éléments : la ligne MACD, la ligne de signal, et l'histogramme qui représente la différence entre les deux.`,
        formula: `Ligne MACD = EMA(12) - EMA(26)
Ligne de Signal = EMA(9) de la ligne MACD
Histogramme = Ligne MACD - Ligne de Signal

où EMA (Moyenne Mobile Exponentielle):
EMA = Prix × k + EMA(précédent) × (1 - k)
k = 2 / (période + 1)

• EMA(12) → Moyenne courte, réactive
• EMA(26) → Moyenne longue, lissée
• EMA(9) → Signal de confirmation`,
        interpretation: [
            "MACD croise au-dessus du Signal → Signal d'achat",
            "MACD croise en-dessous du Signal → Signal de vente",
            "Histogramme positif croissant → Momentum haussier fort",
            "Histogramme négatif croissant → Momentum baissier fort",
            "MACD au-dessus de 0 → Tendance haussière générale"
        ],
        usage: "Excellent pour confirmer les tendances et identifier les retournements. Le croisement des lignes est le signal principal, l'histogramme montre l'intensité."
    },
    {
        id: "bollinger",
        name: "Bandes de Bollinger",
        icon: <Zap className="w-5 h-5" />,
        shortDesc: "Mesure de la volatilité et des niveaux de prix extrêmes",
        explanation: `Les Bandes de Bollinger, créées par John Bollinger, sont composées d'une moyenne mobile centrale et de deux bandes qui s'écartent selon la volatilité du marché.

Quand la volatilité augmente, les bandes s'élargissent. Quand elle diminue, elles se resserrent (squeeze). Un squeeze précède souvent un mouvement de prix important.`,
        formula: `Bande Médiane = SMA(20)
Bande Supérieure = SMA(20) + (2 × σ)
Bande Inférieure = SMA(20) - (2 × σ)

où:
• SMA(20) = Moyenne Mobile Simple sur 20 périodes
• σ (sigma) = Écart-type des 20 derniers prix

Écart-type:
σ = √(Σ(xi - x̄)² / n)`,
        interpretation: [
            "Prix touche la bande supérieure → Potentiellement suracheté",
            "Prix touche la bande inférieure → Potentiellement survendu",
            "Squeeze (bandes serrées) → Explosion de volatilité imminente",
            "Prix sort des bandes → Mouvement fort, continuation possible",
            "Retour vers la moyenne → Comportement normal après excès"
        ],
        usage: "Utilisé pour mesurer la volatilité et identifier les niveaux de prix extrêmes. Particulièrement efficace pour le trading de range et l'identification des breakouts."
    },
    {
        id: "volatility",
        name: "Volatilité (Écart-Type)",
        icon: <Zap className="w-5 h-5" />,
        shortDesc: "Mesure du risque et de la dispersion des rendements",
        explanation: `La volatilité mesure l'amplitude des variations de prix. Elle indique le niveau de risque d'un actif : plus la volatilité est élevée, plus le prix peut varier fortement (à la hausse comme à la baisse).

La volatilité annualisée permet de comparer des actifs sur une base standard (1 an).`,
        formula: `Volatilité journalière = σ(rendements)
Volatilité annualisée = σ × √252

où:
• Rendement journalier = ln(Prix_t / Prix_t-1)
• σ = Écart-type des rendements
• 252 = Nombre de jours de trading par an

σ = √(Σ(ri - r̄)² / (n-1))
• ri = rendement du jour i
• r̄ = rendement moyen`,
        interpretation: [
            "Volatilité < 20% → Actif stable, risque faible",
            "Volatilité 20-40% → Risque modéré, normal pour actions",
            "Volatilité > 40% → Actif très volatil, risque élevé",
            "Crypto > 60% → Volatilité typique des cryptomonnaies",
            "Augmentation soudaine → Incertitude sur le marché"
        ],
        usage: "Essentiel pour évaluer le risque et dimensionner les positions. Une volatilité élevée demande des stop-loss plus larges et des positions plus petites."
    },
    {
        id: "sma-ema",
        name: "Moyennes Mobiles (SMA & EMA)",
        icon: <TrendingUp className="w-5 h-5" />,
        shortDesc: "Lissage des prix pour identifier les tendances",
        explanation: `Les moyennes mobiles lissent les fluctuations de prix pour révéler la tendance sous-jacente.

• SMA (Simple) : Moyenne arithmétique simple, chaque prix a le même poids
• EMA (Exponentielle) : Donne plus d'importance aux prix récents, plus réactive

Les croisements de moyennes mobiles (ex: SMA 50 croisant SMA 200) sont des signaux classiques de changement de tendance.`,
        formula: `SMA(n) = (P1 + P2 + ... + Pn) / n

EMA(n) = Prix × k + EMA(précédent) × (1 - k)
où k = 2 / (n + 1)

Moyennes courantes:
• SMA/EMA 20 → Court terme (1 mois)
• SMA/EMA 50 → Moyen terme (2-3 mois)
• SMA/EMA 200 → Long terme (1 an)`,
        interpretation: [
            "Prix > SMA 200 → Tendance haussière long terme",
            "Prix < SMA 200 → Tendance baissière long terme",
            "SMA 50 croise SMA 200 vers le haut → Golden Cross (très haussier)",
            "SMA 50 croise SMA 200 vers le bas → Death Cross (très baissier)",
            "Prix entre les SMA → Zone de consolidation"
        ],
        usage: "Les moyennes longues (50, 200) identifient la tendance principale. Les moyennes courtes (12, 20) servent pour le timing des entrées/sorties."
    },
    {
        id: "pivot-points",
        name: "Points Pivots (Support & Résistance)",
        icon: <Target className="w-5 h-5" />,
        shortDesc: "Niveaux de prix clés calculés mathématiquement",
        explanation: `Les points pivots sont des niveaux de support et résistance calculés à partir des prix de la période précédente (haut, bas, clôture).

Ces niveaux agissent comme des "aimants" pour le prix : les supports attirent les acheteurs, les résistances attirent les vendeurs. Le point pivot central est le niveau d'équilibre.`,
        formula: `Pivot (P) = (Haut + Bas + Clôture) / 3

Résistances:
R1 = (2 × P) - Bas
R2 = P + (Haut - Bas)

Supports:
S1 = (2 × P) - Haut
S2 = P - (Haut - Bas)

Interprétation spatiale:
R2 > R1 > P > S1 > S2`,
        interpretation: [
            "Prix au-dessus du Pivot → Biais haussier",
            "Prix en-dessous du Pivot → Biais baissier",
            "Rebond sur S1/S2 → Opportunité d'achat",
            "Rejet sur R1/R2 → Opportunité de vente",
            "Cassure d'un niveau → Mouvement vers le niveau suivant"
        ],
        usage: "Très utilisés par les traders intraday. Les niveaux servent d'objectifs de prix et de points pour placer des stop-loss. Fiables sur les marchés liquides."
    },
    {
        id: "stochastic",
        name: "Oscillateur Stochastique",
        icon: <Activity className="w-5 h-5" />,
        shortDesc: "Indicateur de momentum comparant le prix de clôture à la plage de prix",
        explanation: `L'oscillateur stochastique, développé par George Lane, compare le prix de clôture actuel à la plage de prix sur une période donnée.

L'idée est que dans une tendance haussière, les prix ont tendance à clôturer près de leur plus haut, et inversement en tendance baissière. Il génère des signaux de surachat/survente comme le RSI.`,
        formula: `%K = ((Clôture - Plus Bas(n)) / (Plus Haut(n) - Plus Bas(n))) × 100
%D = SMA(3) de %K

où:
• n = période (généralement 14)
• Plus Bas(n) = plus bas sur les n derniers jours
• Plus Haut(n) = plus haut sur les n derniers jours

Zone de surachat: %K > 80
Zone de survente: %K < 20`,
        interpretation: [
            "%K > 80 → Zone de surachat, possible retournement baissier",
            "%K < 20 → Zone de survente, possible rebond haussier",
            "%K croise %D vers le haut → Signal d'achat",
            "%K croise %D vers le bas → Signal de vente",
            "Divergence avec le prix → Possible changement de tendance"
        ],
        usage: "Efficace pour les marchés en range. Les croisements %K/%D près des zones extrêmes sont les signaux les plus fiables. À combiner avec d'autres indicateurs."
    },
    {
        id: "atr",
        name: "ATR (Average True Range)",
        icon: <Zap className="w-5 h-5" />,
        shortDesc: "Mesure de la volatilité moyenne vraie du marché",
        explanation: `L'ATR (Amplitude Moyenne Vraie) mesure la volatilité du marché en prenant en compte les gaps (écarts de prix entre sessions).

Contrairement à d'autres indicateurs, l'ATR n'indique pas la direction du prix, seulement son amplitude de mouvement. Il est essentiel pour le dimensionnement des positions et le placement des stop-loss.`,
        formula: `True Range (TR) = max(
    Haut - Bas,
    |Haut - Clôture précédente|,
    |Bas - Clôture précédente|
)

ATR(n) = Moyenne(TR) sur n périodes

ATR% = (ATR / Prix actuel) × 100
• ATR% > 3% → Volatilité élevée
• ATR% 1.5-3% → Volatilité moyenne
• ATR% < 1.5% → Volatilité faible`,
        interpretation: [
            "ATR croissant → Volatilité en hausse, mouvements plus amples",
            "ATR décroissant → Volatilité en baisse, consolidation possible",
            "Stop-loss recommandé = 2 × ATR sous le prix d'entrée",
            "Objectif de profit = 3 × ATR au-dessus du prix d'entrée",
            "Position sizing: risquer 1% du capital = (1% capital) / (2 × ATR)"
        ],
        usage: "Indispensable pour le money management. L'ATR détermine la taille des stops adaptatifs et aide à calibrer le risque par trade selon la volatilité actuelle."
    },
    {
        id: "knn",
        name: "K-NN (K-Nearest Neighbors)",
        icon: <Calculator className="w-5 h-5" />,
        shortDesc: "Algorithme de Machine Learning pour prédire les prix futurs",
        explanation: `Le K-NN (K Plus Proches Voisins) est un algorithme d'apprentissage automatique supervisé. Il recherche dans l'historique les K situations passées les plus similaires à la situation actuelle.

L'idée est que des patterns de prix similaires tendent à produire des résultats similaires. L'algorithme utilise les variations quotidiennes comme "empreinte" pour trouver les correspondances.`,
        formula: `1. Créer un vecteur de caractéristiques:
   features = [variation_j1, variation_j2, ..., variation_j10]

2. Calculer la distance euclidienne:
   d(a,b) = √(Σ(ai - bi)²)

3. Trouver les K voisins les plus proches

4. Prédiction = moyenne pondérée:
   Ŷ = Σ(wi × yi) / Σ(wi)
   où wi = 1 / (di + ε)

Confiance = 100 - (écart-type des prédictions × 5)`,
        interpretation: [
            "Confiance > 70% → Prédiction relativement fiable",
            "Confiance 40-70% → Prédiction modérément fiable",
            "Confiance < 40% → Pattern actuel peu similaire à l'historique",
            "K=5 → Bon compromis entre bruit et sur-apprentissage",
            "Plus de données historiques → Meilleures correspondances"
        ],
        usage: "Le K-NN fonctionne mieux sur les actifs avec des patterns récurrents. La prédiction est plus fiable quand le marché actuel ressemble fortement à des situations passées."
    },
    {
        id: "monte-carlo",
        name: "Simulation Monte Carlo",
        icon: <Calculator className="w-5 h-5" />,
        shortDesc: "Simulation probabiliste de milliers de scénarios de prix possibles",
        explanation: `La simulation Monte Carlo génère des milliers de trajectoires de prix possibles en utilisant les propriétés statistiques des rendements historiques.

Chaque simulation applique des variations aléatoires (mais réalistes) basées sur la volatilité observée. Cela donne une distribution de prix futurs et des probabilités associées.`,
        formula: `1. Calculer les paramètres historiques:
   μ = moyenne des rendements log
   σ = écart-type des rendements

2. Pour chaque simulation (×1000):
   Prix_t+1 = Prix_t × exp(μ + σ × Z)
   où Z ~ N(0,1) (variable aléatoire normale)

3. Résultats:
   Médiane = 50e percentile des prix finaux
   Intervalle = [10e percentile, 90e percentile]
   P(hausse) = % des simulations > prix actuel`,
        interpretation: [
            "Médiane > Prix actuel → Biais haussier statistique",
            "Intervalle large → Incertitude élevée",
            "P(hausse) > 60% → Probabilité favorable à la hausse",
            "P(hausse) < 40% → Probabilité favorable à la baisse",
            "10e/90e percentiles → Scénarios extrêmes réalistes"
        ],
        usage: "Excellent pour évaluer le risque et les scénarios possibles. Ne prédit pas un prix exact mais donne une vision probabiliste du futur. Idéal pour définir des objectifs et des stops."
    },
    {
        id: "exp-smoothing",
        name: "Lissage Exponentiel (Holt-Winters)",
        icon: <TrendingUp className="w-5 h-5" />,
        shortDesc: "Méthode de prévision de séries temporelles avec tendance",
        explanation: `Le lissage exponentiel de Holt (méthode à double paramètre) est une technique de prévision qui capture à la fois le niveau actuel et la tendance des prix.

Contrairement à une simple moyenne mobile, cette méthode s'adapte continuellement et donne plus de poids aux données récentes tout en suivant la tendance.`,
        formula: `Niveau: Lt = α × Pt + (1-α) × (Lt-1 + Tt-1)
Tendance: Tt = β × (Lt - Lt-1) + (1-β) × Tt-1
Prévision: Ŷt+h = Lt + h × Tt

où:
• α = paramètre de lissage niveau (0.3 typique)
• β = paramètre de lissage tendance (0.1 typique)
• Lt = niveau estimé au temps t
• Tt = tendance estimée au temps t
• h = horizon de prévision (jours)`,
        interpretation: [
            "Prévision au-dessus du prix actuel → Tendance haussière capturée",
            "Prévision en-dessous → Tendance baissière capturée",
            "α élevé → Plus réactif aux changements récents",
            "β élevé → Plus sensible aux changements de tendance",
            "Convergence avec régression linéaire → Signal plus fort"
        ],
        usage: "Très utilisé en prévision de séries temporelles financières. Plus adaptatif que la régression linéaire, il capture les changements de tendance plus rapidement."
    },
    {
        id: "pattern-recognition",
        name: "Reconnaissance de Patterns",
        icon: <BarChart2 className="w-5 h-5" />,
        shortDesc: "Détection automatique des configurations de chandeliers japonais",
        explanation: `L'analyse des chandeliers japonais identifie des configurations visuelles qui ont historiquement précédé des mouvements de prix spécifiques.

L'algorithme analyse les dernières bougies pour détecter des patterns comme le Marteau, l'Englobante, l'Étoile du Matin, etc., et attribue un score de sentiment.`,
        formula: `Patterns haussiers (score +):
• Marteau: corps petit, mèche basse > 2× corps
• Englobante haussière: bougie verte englobe rouge
• Étoile du Matin: bas, doji, puis haut

Patterns baissiers (score -):
• Étoile Filante: corps petit, mèche haute > 2× corps
• Englobante baissière: bougie rouge englobe verte
• Étoile du Soir: haut, doji, puis bas

Score = 50 + Σ(bonus/malus patterns)`,
        interpretation: [
            "Score > 65 → Configuration haussière détectée",
            "Score < 35 → Configuration baissière détectée",
            "Score 35-65 → Pas de pattern clair",
            "Patterns sur supports/résistances → Plus significatifs",
            "Confirmation par volume → Signal renforcé"
        ],
        usage: "Les patterns de chandeliers fonctionnent mieux en confluence avec d'autres indicateurs. Un Marteau sur un support avec RSI survendu est bien plus fiable qu'isolé."
    }
]

export function QuantToolsGuide() {
    const [expandedTool, setExpandedTool] = useState<string | null>(null)

    return (
        <div className="glass-card rounded-3xl p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-gold" />
                </div>
                <div>
                    <h3 className="text-lg font-black text-white">Guide des Outils Quantitatifs</h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                        Comprendre les indicateurs techniques
                    </p>
                </div>
            </div>

            {/* Tools List */}
            <div className="space-y-3">
                {QUANT_TOOLS.map((tool) => (
                    <div
                        key={tool.id}
                        className="rounded-2xl border border-white/5 overflow-hidden"
                    >
                        {/* Tool Header */}
                        <button
                            onClick={() => setExpandedTool(expandedTool === tool.id ? null : tool.id)}
                            className="w-full p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors text-left"
                        >
                            <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-gold">
                                {tool.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-white text-sm">{tool.name}</h4>
                                <p className="text-[10px] text-zinc-500 mt-0.5">{tool.shortDesc}</p>
                            </div>
                            <ChevronDown className={cn(
                                "w-5 h-5 text-zinc-500 transition-transform",
                                expandedTool === tool.id && "rotate-180"
                            )} />
                        </button>

                        {/* Expanded Content */}
                        <AnimatePresence>
                            {expandedTool === tool.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="border-t border-white/5"
                                >
                                    <div className="p-5 space-y-5">
                                        {/* Explanation */}
                                        <div>
                                            <h5 className="text-[10px] font-black text-gold uppercase tracking-widest mb-2">
                                                Explication
                                            </h5>
                                            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                                                {tool.explanation}
                                            </p>
                                        </div>

                                        {/* Formula */}
                                        <div>
                                            <h5 className="text-[10px] font-black text-gold uppercase tracking-widest mb-2 flex items-center gap-2">
                                                <Calculator className="w-3.5 h-3.5" />
                                                Formule Mathématique
                                            </h5>
                                            <pre className="p-4 bg-zinc-950 rounded-xl text-sm text-emerald-400 font-mono overflow-x-auto border border-white/5">
                                                {tool.formula}
                                            </pre>
                                        </div>

                                        {/* Interpretation */}
                                        <div>
                                            <h5 className="text-[10px] font-black text-gold uppercase tracking-widest mb-2">
                                                Interprétation
                                            </h5>
                                            <ul className="space-y-2">
                                                {tool.interpretation.map((item, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-sm text-zinc-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0" />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Usage */}
                                        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                            <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">
                                                💡 Conseil d'utilisation
                                            </h5>
                                            <p className="text-sm text-blue-300/80">
                                                {tool.usage}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            {/* Footer Note */}
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <p className="text-[10px] text-amber-500/80 font-bold">
                    ⚠️ Ces indicateurs sont des outils d'aide à la décision. Aucun indicateur n'est parfait à 100%.
                    Utilisez toujours plusieurs indicateurs en combinaison et considérez le contexte global du marché.
                </p>
            </div>
        </div>
    )
}
