import { BudgetCategory, BudgetIncome, Transaction, BudgetSummary } from "@/types";

export function calculateBudgetSummary(
    categories: BudgetCategory[],
    incomes: BudgetIncome[],
    transactions: Transaction[]
): BudgetSummary {
    const totalIncome = incomes.reduce((sum, inc) => sum + Number(inc.amount), 0);
    const totalBudgeted = categories.reduce((sum, cat) => sum + Number(cat.target_amount), 0);

    // Filter transactions for the current month (or whatever period is relevant)
    // For this initial implementation, we assume transactions passed are already filtered for the period
    const totalSpent = transactions.reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0);

    const categoryStats = categories.map(cat => {
        const spent = transactions
            .filter(tx => tx.category === cat.name)
            .reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0);

        return {
            ...cat,
            spent,
            remaining: Number(cat.target_amount) - spent,
            percentage: cat.target_amount > 0 ? (spent / Number(cat.target_amount)) * 100 : 0
        };
    });

    const remaining = totalBudgeted - totalSpent;
    const savingsMargin = totalIncome - totalSpent;
    const savingsRate = totalIncome > 0 ? (savingsMargin / totalIncome) * 100 : 0;

    return {
        totalIncome,
        totalBudgeted,
        totalSpent,
        remaining,
        savingsMargin,
        savingsRate,
        categories: categoryStats
    };
}

export function generateBudgetRecommendations(summary: BudgetSummary) {
    const recommendations: string[] = [];

    summary.categories.forEach(cat => {
        if (cat.percentage >= 90 && cat.percentage < 100) {
            recommendations.push(`Alerte: Tu as consommé ${cat.percentage.toFixed(0)}% du budget "${cat.name}". Pense à lever le pied.`);
        } else if (cat.percentage >= 100) {
            recommendations.push(`Budget dépassé pour "${cat.name}". Essaie de réduire les dépenses sur ce pôle le mois prochain.`);
        }
    });

    if (summary.totalBudgeted > summary.totalIncome) {
        recommendations.push("Attention: Ton budget total dépasse tes revenus. Tu risques un déficit.");
    }

    if (summary.savingsMargin > 0 && summary.savingsRate < 10) {
        recommendations.push("Conseil: Ta marge est positive. Pense à mettre de côté au moins 10% de tes revenus.");
    }

    if (summary.categories.find(c => c.name === "Restaurants" && c.percentage > 15)) {
        // Arbitrary threshold for demo
        // recommendations.push("Astuce: Les sorties resto pèsent lourd ce mois-ci. Un petit défi sans resto la semaine prochaine ?");
    }

    return recommendations;
}
