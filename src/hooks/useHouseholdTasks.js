import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabase";

const normalize = (task) => ({ ...task, group: task.task_group, done: task.completed, owner: task.assigned_to, due: task.due_date });

export function useHouseholdTasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const refresh = useCallback(async () => {
        if (!supabase) return;
        let { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            const { data, error: authError } = await supabase.auth.signInAnonymously();
            if (authError) { setError(authError.message); setLoading(false); return; }
            user = data.user;
        }
        const { data, error: queryError } = await supabase.from("household_tasks").select("*").order("completed").order("due_date");
        if (queryError) setError(queryError.message);
        else setTasks((data || []).map(normalize));
        setLoading(false);
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const addTask = async (task) => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error: insertError } = await supabase.from("household_tasks").insert({ ...task, created_by: user.id }).select().single();
        if (insertError) throw insertError;
        setTasks((current) => [...current, normalize(data)]);
    };
    const toggleTask = async (task) => {
        const { data, error: updateError } = await supabase.from("household_tasks").update({ completed: !task.completed }).eq("id", task.id).select().single();
        if (updateError) throw updateError;
        setTasks((current) => current.map((item) => item.id === task.id ? normalize(data) : item));
    };

    const updateTask = async (taskId, changes) => {
        const { data, error: updateError } = await supabase
            .from("household_tasks")
            .update(changes)
            .eq("id", taskId)
            .select()
            .single();
        if (updateError) throw updateError;
        setTasks((current) => current.map((item) => item.id === taskId ? normalize(data) : item));
    };

    const removeTask = async (taskId) => {
        const { error: deleteError } = await supabase.from("household_tasks").delete().eq("id", taskId);
        if (deleteError) throw deleteError;
        setTasks((current) => current.filter((item) => item.id !== taskId));
    };

    return { tasks, loading, error, addTask, toggleTask, updateTask, removeTask };
}
