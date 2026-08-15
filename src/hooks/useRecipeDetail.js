import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabase";

const BUCKET = "recipe-images";

const imageUrl = (path) => (path ? supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl : "");

const readImage = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

export function useRecipeDetail(recipeId) {
    const [recipe, setRecipe] = useState(null);
    const [ingredients, setIngredients] = useState([]);
    const [steps, setSteps] = useState([]);
    const [canEdit, setCanEdit] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const refresh = useCallback(async () => {
        if (!supabase || !recipeId) return;
        setLoading(true);
        let user = (await supabase.auth.getUser()).data.user;
        if (!user) {
            const { data, error: authError } = await supabase.auth.signInAnonymously();
            if (authError) {
                setError(authError.message);
                setLoading(false);
                return;
            }
            user = data.user;
        }
        const [{ data: recipeData, error: recipeError }, { data: ingredientData, error: ingredientError }, { data: stepData, error: stepError }] = await Promise.all([
            supabase.from("recipes").select("*").eq("id", recipeId).single(),
            supabase.from("recipe_ingredients").select("*").eq("recipe_id", recipeId).order("position"),
            supabase.from("recipe_steps").select("*").eq("recipe_id", recipeId).order("position"),
        ]);
        const loadError = recipeError || ingredientError || stepError;
        if (loadError) setError(loadError.message);
        else {
            setRecipe({ ...recipeData, image_url: imageUrl(recipeData.image_path) });
            setIngredients(ingredientData || []);
            setSteps(stepData || []);
            setCanEdit(Boolean(user));
        }
        setLoading(false);
    }, [recipeId]);

    useEffect(() => { refresh(); }, [refresh]);

    const updateRecipe = async (changes) => {
        const { data, error: updateError } = await supabase.from("recipes").update(changes).eq("id", recipeId).select().single();
        if (updateError) throw updateError;
        setRecipe((current) => ({ ...data, image_url: imageUrl(data.image_path) }));
    };

    const replaceImage = async (file) => {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user || !file) return;
        const content = typeof file === "string" ? await fetch(file).then((response) => response.blob()) : file;
        const extension = content.type?.split("/")[1] || "jpg";
        const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, content, { contentType: content.type, upsert: false });
        if (uploadError) throw uploadError;
        const previousPath = recipe.image_path;
        try {
            await updateRecipe({ image_path: path });
            if (previousPath) await supabase.storage.from(BUCKET).remove([previousPath]);
        } catch (replaceError) {
            await supabase.storage.from(BUCKET).remove([path]);
            throw replaceError;
        }
    };

    const addIngredient = async (name, quantity) => {
        const { data, error: insertError } = await supabase.from("recipe_ingredients").insert({ recipe_id: recipeId, name, quantity, position: ingredients.length }).select().single();
        if (insertError) throw insertError;
        setIngredients((current) => [...current, data]);
    };
    const updateIngredient = async (id, changes) => {
        const { data, error: updateError } = await supabase.from("recipe_ingredients").update(changes).eq("id", id).select().single();
        if (updateError) throw updateError;
        setIngredients((current) => current.map((item) => item.id === id ? data : item));
    };
    const deleteIngredient = async (id) => {
        const { error: deleteError } = await supabase.from("recipe_ingredients").delete().eq("id", id);
        if (deleteError) throw deleteError;
        setIngredients((current) => current.filter((item) => item.id !== id));
    };
    const addStep = async (instruction) => {
        const { data, error: insertError } = await supabase.from("recipe_steps").insert({ recipe_id: recipeId, instruction, position: steps.length }).select().single();
        if (insertError) throw insertError;
        setSteps((current) => [...current, data]);
    };
    const updateStep = async (id, instruction) => {
        const { data, error: updateError } = await supabase.from("recipe_steps").update({ instruction }).eq("id", id).select().single();
        if (updateError) throw updateError;
        setSteps((current) => current.map((item) => item.id === id ? data : item));
    };
    const deleteStep = async (id) => {
        const { error: deleteError } = await supabase.from("recipe_steps").delete().eq("id", id);
        if (deleteError) throw deleteError;
        setSteps((current) => current.filter((item) => item.id !== id));
    };

    return { recipe, ingredients, steps, canEdit, loading, error, readImage, updateRecipe, replaceImage, addIngredient, updateIngredient, deleteIngredient, addStep, updateStep, deleteStep };
}
