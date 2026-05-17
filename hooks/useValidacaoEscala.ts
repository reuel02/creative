import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Culto, Voluntario } from '@/lib/types/database';

export type RegraBloqueio = {
  regra: 1 | 2;
  mensagem: string;
};

export function useValidacaoEscala(
  cultoId: number | '',
  departamentoId: number | '',
  cultos: Culto[],
  voluntarios: Voluntario[]
) {
  const [loadingValidacao, setLoadingValidacao] = useState(false);
  const [bloqueios, setBloqueios] = useState<Record<number, RegraBloqueio>>({});
  const [equipeReduzida, setEquipeReduzida] = useState(false);

  useEffect(() => {
    async function validar() {
      // Condição inicial: se não temos os dados necessários, não há o que validar
      if (cultoId === '' || departamentoId === '' || voluntarios.length === 0) {
        setBloqueios({});
        setEquipeReduzida(false);
        return;
      }

      // Regra 3: Equipes Reduzidas (Exceção de Ouro)
      // Se há menos de 3 voluntários ativos no departamento selecionado,
      // as regras 1 e 2 são ignoradas.
      if (voluntarios.length < 3) {
        setBloqueios({});
        setEquipeReduzida(true);
        return;
      }

      setEquipeReduzida(false);
      setLoadingValidacao(true);

      try {
        const supabase = createClient();
        const cultoSelecionado = cultos.find(c => c.id === cultoId);
        
        if (!cultoSelecionado) {
          setBloqueios({});
          return;
        }

        const dataBaseStr = cultoSelecionado.data.includes('T') 
          ? cultoSelecionado.data.split('T')[0] 
          : cultoSelecionado.data.split(' ')[0];
          
        const dataBase = new Date(dataBaseStr + 'T12:00:00');

        const diaAnterior = new Date(dataBase);
        diaAnterior.setDate(diaAnterior.getDate() - 1);
        const diaAnteriorStr = diaAnterior.toISOString().split('T')[0];

        const diaSeguinte = new Date(dataBase);
        diaSeguinte.setDate(diaSeguinte.getDate() + 1);
        const diaSeguinteStr = diaSeguinte.toISOString().split('T')[0];

        // Lógica de Ordenação de Cultos para achar o Imediatamente Anterior e Posterior
        const sortedCultos = [...cultos].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
        const currentIndex = sortedCultos.findIndex(c => c.id === cultoId);
        
        const cultoAnterior = currentIndex > 0 ? sortedCultos[currentIndex - 1] : null;
        const cultoPosterior = currentIndex < sortedCultos.length - 1 ? sortedCultos[currentIndex + 1] : null;

        const idsCultosAdjacentes = [cultoAnterior?.id, cultoPosterior?.id].filter(Boolean) as number[];

        // --- Regra 1: Buscar escalas do dia anterior, mesmo dia e dia seguinte (em QUALQUER departamento)
        const { data: escalasRegra1 } = await supabase
          .from('escalas')
          .select('id, data_hora')
          .or(`data_hora.ilike.${diaAnteriorStr}%,data_hora.ilike.${dataBaseStr}%,data_hora.ilike.${diaSeguinteStr}%`);

        // --- Regra 2: Buscar escalas nos cultos imediatamente anterior/posterior (MESMO departamento)
        let escalasRegra2: { id: number }[] = [];
        if (idsCultosAdjacentes.length > 0) {
          const { data } = await supabase
            .from('escalas')
            .select('id')
            .in('culto_id', idsCultosAdjacentes)
            .eq('departamento_id', departamentoId);
          if (data) {
            escalasRegra2 = data;
          }
        }

        const idsEscalas1 = escalasRegra1?.map(e => e.id) || [];
        const idsEscalas2 = escalasRegra2.map(e => e.id) || [];
        const todasEscalasIds = Array.from(new Set([...idsEscalas1, ...idsEscalas2]));

        const novosBloqueios: Record<number, RegraBloqueio> = {};

        if (todasEscalasIds.length > 0) {
          const { data: vinculos } = await supabase
            .from('escala_voluntarios')
            .select('voluntario_id, escala_id')
            .in('escala_id', todasEscalasIds);

          if (vinculos) {
            for (const v of vinculos) {
              // Verifica Regra 2 (Cultos Consecutivos do mesmo departamento)
              if (idsEscalas2.includes(v.escala_id)) {
                novosBloqueios[v.voluntario_id] = { regra: 2, mensagem: 'Participou do último culto' };
                continue; // Dá prioridade para essa mensagem ou vai para o próximo
              }

              // Verifica Regra 1 (Dias Próximos)
              if (idsEscalas1.includes(v.escala_id)) {
                const escalaRef = escalasRegra1?.find(e => e.id === v.escala_id);
                if (escalaRef) {
                  const dataConfFull = escalaRef.data_hora.includes('T') 
                    ? escalaRef.data_hora.split('T')[0] 
                    : escalaRef.data_hora.split(' ')[0];
                  const [, mes, dia] = dataConfFull.split('-');
                  
                  // Evita sobrescrever bloqueio da regra 2 com regra 1
                  if (!novosBloqueios[v.voluntario_id]) {
                    novosBloqueios[v.voluntario_id] = { regra: 1, mensagem: `Descanso obrigatório (${dia}/${mes})` };
                  }
                }
              }
            }
          }
        }

        setBloqueios(novosBloqueios);

      } catch (err) {
        console.error('Erro na validação de escalas:', err);
      } finally {
        setLoadingValidacao(false);
      }
    }

    validar();
  }, [cultoId, departamentoId, voluntarios.length, cultos]);

  return { loadingValidacao, bloqueios, equipeReduzida };
}
