// store/item.js
import { defineStore } from 'pinia'

export const useItemStore = defineStore('item', {
    state: () => ({
        currentItem: null
    }),
    actions: {
        setItem(item) {
            this.currentItem = item
        }
    }
})
