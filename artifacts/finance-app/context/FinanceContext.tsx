import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: "wallet" | "bank" | "savings";
  balance: number;
  color: string;
  created_at: string;
}

export interface CreditCard {
  id: string;
  user_id: string;
  name: string;
  limit: number;
  balance: number;
  closing_day: number;
  due_day: number;
  color: string;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  type: "expense" | "income";
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: "expense" | "income" | "card_expense" | "transfer";
  amount: number;
  description: string;
  date: string;
  category_id: string | null;
  account_id: string | null;
  card_id: string | null;
  to_account_id: string | null;
  status: "paid" | "pending";
  recurrence_id: string | null;
  created_at: string;
  category?: Category;
  account?: Account;
  card?: CreditCard;
}

export interface Recurrence {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  type: "expense" | "income" | "card_expense";
  category_id: string | null;
  account_id: string | null;
  card_id: string | null;
  day_of_month: number;
  active: boolean;
  created_at: string;
  category?: Category;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  month: number;
  year: number;
  created_at: string;
  category?: Category;
  spent?: number;
}

interface FinanceContextType {
  accounts: Account[];
  creditCards: CreditCard[];
  categories: Category[];
  transactions: Transaction[];
  recurrences: Recurrence[];
  budgets: Budget[];
  loading: boolean;
  selectedMonth: Date;
  setSelectedMonth: (date: Date) => void;
  refreshAll: () => Promise<void>;
  addAccount: (data: Omit<Account, "id" | "user_id" | "created_at">) => Promise<void>;
  updateAccount: (id: string, data: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  addCreditCard: (data: Omit<CreditCard, "id" | "user_id" | "created_at">) => Promise<void>;
  updateCreditCard: (id: string, data: Partial<CreditCard>) => Promise<void>;
  deleteCreditCard: (id: string) => Promise<void>;
  addCategory: (data: Omit<Category, "id" | "user_id" | "created_at">) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addTransaction: (data: Omit<Transaction, "id" | "user_id" | "created_at" | "category" | "account" | "card">) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addRecurrence: (data: Omit<Recurrence, "id" | "user_id" | "created_at" | "category">) => Promise<void>;
  updateRecurrence: (id: string, data: Partial<Recurrence>) => Promise<void>;
  deleteRecurrence: (id: string) => Promise<void>;
  addBudget: (data: Omit<Budget, "id" | "user_id" | "created_at" | "category" | "spent">) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  getTotalBalance: () => number;
  getMonthlyIncome: () => number;
  getMonthlyExpenses: () => number;
  getMonthlyTransactions: () => Transaction[];
  getPendingTransactions: () => Transaction[];
}

const FinanceContext = createContext<FinanceContextType>({} as FinanceContextType);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurrences, setRecurrences] = useState<Recurrence[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const refreshAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [
        { data: accs },
        { data: cards },
        { data: cats },
        { data: txns },
        { data: recs },
        { data: bdgs },
      ] = await Promise.all([
        supabase.from("accounts").select("*").eq("user_id", user.id).order("created_at"),
        supabase.from("credit_cards").select("*").eq("user_id", user.id).order("created_at"),
        supabase.from("categories").select("*").eq("user_id", user.id).order("name"),
        supabase.from("transactions").select("*, category:categories(*), account:accounts(*), card:credit_cards(*)").eq("user_id", user.id).order("date", { ascending: false }).order("created_at", { ascending: false }),
        supabase.from("recurrences").select("*, category:categories(*)").eq("user_id", user.id).order("created_at"),
        supabase.from("budgets").select("*, category:categories(*)").eq("user_id", user.id),
      ]);

      setAccounts(accs ?? []);
      setCreditCards(cards ?? []);
      setCategories(cats ?? []);
      setTransactions((txns ?? []) as Transaction[]);
      setRecurrences((recs ?? []) as Recurrence[]);

      const monthlyTxns = (txns ?? []) as Transaction[];
      const bdgsWithSpent = (bdgs ?? []).map((b) => {
        const spent = monthlyTxns
          .filter((t) => t.category_id === b.category_id && t.status === "paid" && (t.type === "expense" || t.type === "card_expense"))
          .reduce((sum, t) => sum + t.amount, 0);
        return { ...b, spent };
      });
      setBudgets(bdgsWithSpent as Budget[]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) refreshAll();
  }, [user, refreshAll]);

  const addAccount = async (data: Omit<Account, "id" | "user_id" | "created_at">) => {
    if (!user) return;
    await supabase.from("accounts").insert({ ...data, user_id: user.id });
    await refreshAll();
  };

  const updateAccount = async (id: string, data: Partial<Account>) => {
    await supabase.from("accounts").update(data).eq("id", id);
    await refreshAll();
  };

  const deleteAccount = async (id: string) => {
    await supabase.from("accounts").delete().eq("id", id);
    await refreshAll();
  };

  const addCreditCard = async (data: Omit<CreditCard, "id" | "user_id" | "created_at">) => {
    if (!user) return;
    await supabase.from("credit_cards").insert({ ...data, user_id: user.id });
    await refreshAll();
  };

  const updateCreditCard = async (id: string, data: Partial<CreditCard>) => {
    await supabase.from("credit_cards").update(data).eq("id", id);
    await refreshAll();
  };

  const deleteCreditCard = async (id: string) => {
    await supabase.from("credit_cards").delete().eq("id", id);
    await refreshAll();
  };

  const addCategory = async (data: Omit<Category, "id" | "user_id" | "created_at">) => {
    if (!user) return;
    await supabase.from("categories").insert({ ...data, user_id: user.id });
    await refreshAll();
  };

  const deleteCategory = async (id: string) => {
    await supabase.from("categories").delete().eq("id", id);
    await refreshAll();
  };

  const addTransaction = async (data: Omit<Transaction, "id" | "user_id" | "created_at" | "category" | "account" | "card">) => {
    if (!user) return;
    await supabase.from("transactions").insert({ ...data, user_id: user.id });
    // Update account/card balances
    if (data.status === "paid") {
      if (data.type === "expense" && data.account_id) {
        const acc = accounts.find((a) => a.id === data.account_id);
        if (acc) await supabase.from("accounts").update({ balance: acc.balance - data.amount }).eq("id", acc.id);
      } else if (data.type === "income" && data.account_id) {
        const acc = accounts.find((a) => a.id === data.account_id);
        if (acc) await supabase.from("accounts").update({ balance: acc.balance + data.amount }).eq("id", acc.id);
      } else if (data.type === "card_expense" && data.card_id) {
        const card = creditCards.find((c) => c.id === data.card_id);
        if (card) await supabase.from("credit_cards").update({ balance: card.balance + data.amount }).eq("id", card.id);
      } else if (data.type === "transfer" && data.account_id && data.to_account_id) {
        const from = accounts.find((a) => a.id === data.account_id);
        const to = accounts.find((a) => a.id === data.to_account_id);
        if (from) await supabase.from("accounts").update({ balance: from.balance - data.amount }).eq("id", from.id);
        if (to) await supabase.from("accounts").update({ balance: to.balance + data.amount }).eq("id", to.id);
      }
    }
    await refreshAll();
  };

  const updateTransaction = async (id: string, data: Partial<Transaction>) => {
    await supabase.from("transactions").update(data).eq("id", id);
    await refreshAll();
  };

  const deleteTransaction = async (id: string) => {
    await supabase.from("transactions").delete().eq("id", id);
    await refreshAll();
  };

  const addRecurrence = async (data: Omit<Recurrence, "id" | "user_id" | "created_at" | "category">) => {
    if (!user) return;
    await supabase.from("recurrences").insert({ ...data, user_id: user.id });
    await refreshAll();
  };

  const updateRecurrence = async (id: string, data: Partial<Recurrence>) => {
    await supabase.from("recurrences").update(data).eq("id", id);
    await refreshAll();
  };

  const deleteRecurrence = async (id: string) => {
    await supabase.from("recurrences").delete().eq("id", id);
    await refreshAll();
  };

  const addBudget = async (data: Omit<Budget, "id" | "user_id" | "created_at" | "category" | "spent">) => {
    if (!user) return;
    await supabase.from("budgets").insert({ ...data, user_id: user.id });
    await refreshAll();
  };

  const deleteBudget = async (id: string) => {
    await supabase.from("budgets").delete().eq("id", id);
    await refreshAll();
  };

  const getTotalBalance = () => accounts.reduce((sum, a) => sum + a.balance, 0);

  const getMonthlyTransactions = () => {
    const y = selectedMonth.getFullYear();
    const m = selectedMonth.getMonth();
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === y && d.getMonth() === m;
    });
  };

  const getMonthlyIncome = () =>
    getMonthlyTransactions()
      .filter((t) => t.type === "income" && t.status === "paid")
      .reduce((sum, t) => sum + t.amount, 0);

  const getMonthlyExpenses = () =>
    getMonthlyTransactions()
      .filter((t) => (t.type === "expense" || t.type === "card_expense") && t.status === "paid")
      .reduce((sum, t) => sum + t.amount, 0);

  const getPendingTransactions = () =>
    getMonthlyTransactions().filter((t) => t.status === "pending");

  return (
    <FinanceContext.Provider value={{
      accounts, creditCards, categories, transactions, recurrences, budgets,
      loading, selectedMonth, setSelectedMonth, refreshAll,
      addAccount, updateAccount, deleteAccount: deleteAccount,
      addCreditCard, updateCreditCard, deleteCreditCard,
      addCategory, deleteCategory,
      addTransaction, updateTransaction, deleteTransaction,
      addRecurrence, updateRecurrence, deleteRecurrence,
      addBudget, deleteBudget,
      getTotalBalance, getMonthlyIncome, getMonthlyExpenses,
      getMonthlyTransactions, getPendingTransactions,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export const useFinance = () => useContext(FinanceContext);
