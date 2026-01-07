/**
 * Broker/Bank data for investment account association
 * Used in the BrokerSelector UI component
 */

export interface BrokerData {
    id: string;
    name: string;
    logo: string; // Path to logo in public/brokers/
}

export const BROKERS: BrokerData[] = [
    // Online Brokers
    { id: 'trade_republic', name: 'Trade Republic', logo: '/brokers/trade-republic.svg' },
    { id: 'degiro', name: 'DEGIRO', logo: '/brokers/degiro.svg' },
    { id: 'interactive_brokers', name: 'Interactive Brokers', logo: '/brokers/interactive-brokers.svg' },
    { id: 'saxo', name: 'Saxo Banque', logo: '/brokers/saxo.svg' },
    { id: 'bourse_direct', name: 'Bourse Direct', logo: '/brokers/bourse-direct.svg' },
    { id: 'etoro', name: 'eToro', logo: '/brokers/etoro.svg' },

    // French Banks
    { id: 'boursorama', name: 'Boursorama', logo: '/brokers/boursorama.svg' },
    { id: 'fortuneo', name: 'Fortuneo', logo: '/brokers/fortuneo.svg' },
    { id: 'bnp', name: 'BNP Paribas', logo: '/brokers/bnp.svg' },
    { id: 'credit_agricole', name: 'Crédit Agricole', logo: '/brokers/credit-agricole.svg' },
    { id: 'societe_generale', name: 'Société Générale', logo: '/brokers/societe-generale.svg' },
    { id: 'lcl', name: 'LCL', logo: '/brokers/lcl.svg' },
    { id: 'caisse_epargne', name: 'Caisse d\'Épargne', logo: '/brokers/caisse-epargne.svg' },
    { id: 'credit_mutuel', name: 'Crédit Mutuel', logo: '/brokers/credit-mutuel.svg' },
    { id: 'la_banque_postale', name: 'La Banque Postale', logo: '/brokers/la-banque-postale.svg' },

    // Insurance/Life Insurance
    { id: 'linxea', name: 'Linxea', logo: '/brokers/linxea.svg' },
    { id: 'yomoni', name: 'Yomoni', logo: '/brokers/yomoni.svg' },
    { id: 'nalo', name: 'Nalo', logo: '/brokers/nalo.svg' },
    { id: 'axa', name: 'AXA', logo: '/brokers/axa.svg' },
    { id: 'generali', name: 'Generali', logo: '/brokers/generali.svg' },
    { id: 'swisslife', name: 'Swiss Life', logo: '/brokers/swisslife.svg' },

    // PEE Providers
    { id: 'amundi', name: 'Amundi', logo: '/brokers/amundi.svg' },
    { id: 'natixis', name: 'Natixis', logo: '/brokers/natixis.svg' },

    // Crypto
    { id: 'binance', name: 'Binance', logo: '/brokers/binance.svg' },
    { id: 'coinbase', name: 'Coinbase', logo: '/brokers/coinbase.svg' },
    { id: 'kraken', name: 'Kraken', logo: '/brokers/kraken.svg' },

    // Other
    { id: 'other', name: 'Autre', logo: '/brokers/other.svg' },
];

export const INVESTMENT_ACCOUNT_TYPES = [
    { id: 'pea', name: 'PEA', description: 'Plan d\'Épargne en Actions' },
    { id: 'pea_pme', name: 'PEA-PME', description: 'PEA petites et moyennes entreprises' },
    { id: 'cto', name: 'CTO', description: 'Compte-Titres Ordinaire' },
    { id: 'pee', name: 'PEE', description: 'Plan d\'Épargne Entreprise' },
    { id: 'perco', name: 'PERCO', description: 'Plan d\'Épargne Retraite Collectif' },
    { id: 'per', name: 'PER', description: 'Plan d\'Épargne Retraite' },
    { id: 'assurance_vie', name: 'Assurance Vie', description: 'Contrat d\'assurance vie' },
    { id: 'crypto', name: 'Crypto', description: 'Portefeuille crypto' },
    { id: 'other', name: 'Autre', description: 'Autre type de compte' },
] as const;

export type InvestmentAccountTypeId = typeof INVESTMENT_ACCOUNT_TYPES[number]['id'];

export function getBrokerById(id: string): BrokerData | undefined {
    return BROKERS.find(b => b.id === id);
}

export function getAccountTypeById(id: string) {
    return INVESTMENT_ACCOUNT_TYPES.find(t => t.id === id);
}
