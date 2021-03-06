import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export function getFormatedDate(date: string): string {
  const formatedDate = format(new Date(date), `dd MMM yyyy`, {
    locale: ptBR,
  });

  return formatedDate;
}
