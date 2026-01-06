"use client"

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BudgetCategory } from '@/types'

const transactionSchema = z.object({
    description: z.string().min(1, "Description requise"),
    amount: z.number().min(0.01, "Le montant doit être supérieur à 0"),
    category: z.string().min(1, "Catégorie requise"),
    date: z.string().min(1, "Date requise"),
    notes: z.string().optional()
})

type TransactionFormValues = z.infer<typeof transactionSchema>

interface AddExpenseProps {
    isOpen: boolean
    onClose: () => void
    onAdd: (data: TransactionFormValues) => void
    categories: BudgetCategory[]
}

export function AddExpenseDialog({ isOpen, onClose, onAdd, categories }: AddExpenseProps) {
    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<TransactionFormValues>({
        resolver: zodResolver(transactionSchema) as any,
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            amount: 0,
            description: ''
        }
    })

    const onSubmit = (data: TransactionFormValues) => {
        onAdd(data)
        reset()
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] glass border-white/10 bg-[#0a0f19]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-premium">Ajouter une dépense</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Saisissez les détails de votre dépense pour mettre à jour votre budget.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-zinc-300">Description</Label>
                        <Input
                            id="description"
                            {...register('description')}
                            className="input-glass"
                            placeholder="ex: Courses Monoprix"
                        />
                        {errors.description && <p className="text-xs text-rose-500">{errors.description.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount" className="text-zinc-300">Montant (€)</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                {...register('amount', { valueAsNumber: true })}
                                className="input-glass"
                            />
                            {errors.amount && <p className="text-xs text-rose-500">{errors.amount.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date" className="text-zinc-300">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                {...register('date')}
                                className="input-glass"
                            />
                            {errors.date && <p className="text-xs text-rose-500">{errors.date.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category" className="text-zinc-300">Pôle de dépense</Label>
                        <Select onValueChange={(val) => setValue('category', val)}>
                            <SelectTrigger className="input-glass">
                                <SelectValue placeholder="Choisir un pôle" />
                            </SelectTrigger>
                            <SelectContent className="glass border-white/10 bg-[#0a0f19]">
                                {categories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.name} className="text-white hover:bg-white/5">
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.category && <p className="text-xs text-rose-500">{errors.category.message}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose} className="text-zinc-400 hover:text-white">
                            Annuler
                        </Button>
                        <Button type="submit" className="premium-button px-8">
                            Ajouter
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
