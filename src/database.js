import { supabase } from "./supabaseClient";

// Inserir eleitor
export async function inserirEleitor(nome, cpfHash, idade) {
  return await supabase.from("eleitores").insert([{ nome, cpf_hash: cpfHash, idade }]);
}

// Inserir candidato
export async function inserirCandidato(nome, numero) {
  return await supabase.from("candidatos").insert([{ nome, numero }]);
}

// Inserir voto
export async function inserirVoto(eleitorId, candidatoId) {
  return await supabase.from("votos").insert([{ eleitor_id: eleitorId, candidato_id: candidatoId }]);
}

// Consultar resultados
export async function consultarResultados() {
  const { data, error } = await supabase
    .from("candidatos")
    .select("id, nome, votos:votos(count)");

  return { data, error };
}
