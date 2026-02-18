import { defineFunction } from "@aws-amplify/backend";

export const updateAbout = defineFunction({
    name: 'updateAbout',
    entry: './getAbout.ts'
})