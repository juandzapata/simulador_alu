import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EjecutarTareaService {

  constructor() { }

  ejecutarTareaDespuesDeCiertoTiempo(tarea: CallableFunction): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        tarea();
        resolve();
      }, 800);
    });
  }
}
