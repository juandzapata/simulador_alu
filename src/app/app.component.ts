import { Component } from '@angular/core';
import { Instruccion } from './Models/instruccion';
import { ALU } from './Models/alu';
import { Memoria } from './Models/memoria';
import { Registros } from './Models/registros';
import { ElementoProcesador } from './Enums/elemento-procesador';
import { EjecutarTareaService } from './Services/ejecutar-tarea.service';
import { EstadoComputador } from './Enums/estado-computador';
import { OperacionInstruccion } from './Enums/operacion-instruccion';
import { VariableInstruccion } from './Enums/variable-instruccion';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {

  // Elementos de la interfaz
  instruccionesIntroducidas: string = '';
  elementoActivo: ElementoProcesador;
  estadoComputador: EstadoComputador;

  // Elementos del procesador
  PC: number = 0;
  MAR: number = 0;
  MBR: Instruccion | undefined;
  IR: Instruccion | undefined;
  ALU: ALU = new ALU();
  memoria: Memoria = new Memoria();
  registros: Registros = new Registros();

  constructor(private ejecutarTareaService: EjecutarTareaService) {
    this.estadoComputador = EstadoComputador.SIN_INICIAR;
    this.elementoActivo = ElementoProcesador.UNIDAD_CONTROL;
  }

  /**
   * Inicia la ejecución de las instrucciones introducidas
   */
  cargarYEjecutarInstrucciones() {
    this.estadoComputador = EstadoComputador.EN_EJECUCION;
    this.guardarInstruccionesEnMemoria();
    this.ejecutarInstruccionesGuardadas();
  }

  /**
   * Guarda las instrucciones introducidas en memoria para su posterior ejecución
   */
  private guardarInstruccionesEnMemoria() {
    this.memoria = new Memoria();
    let instruccionesArray = this.instruccionesIntroducidas.split('\n');
    instruccionesArray.forEach((instruccion) => {
      this.memoria.agregarInstruccion(instruccion);
    });
  }

  private hayLineaPorEjecutar() {
    return this.PC < this.memoria.celdas.length;
  }

  /**
   *  Ejecuta las instrucciones guardadas en memoria
   */
  private async ejecutarInstruccionesGuardadas() {
    await this.ejecutarTareaService.ejecutarDelay(() => {
      this.elementoActivo = ElementoProcesador.PC;
    })
    await this.ejecutarTareaService.ejecutarDelay(() => {
      this.elementoActivo = ElementoProcesador.MAR;
    })
    await this.ejecutarTareaService.ejecutarDelay(() => {
      this.MAR = this.PC;
    })
    await this.ejecutarTareaService.ejecutarDelay(() => {
      this.elementoActivo = ElementoProcesador.BUS_DIRECCIONES;
    })
    await this.ejecutarTareaService.ejecutarDelay(() => {
      this.elementoActivo = ElementoProcesador.MEMORIA;
    })
    await this.ejecutarTareaService.ejecutarDelay(() => {
      this.elementoActivo = ElementoProcesador.BUS_DATOS;
    })
    await this.ejecutarTareaService.ejecutarDelay(() => {
      this.elementoActivo = ElementoProcesador.MBR;
    })
    await this.ejecutarTareaService.ejecutarDelay(() => {
      this.MBR = this.memoria.obtenerInstruccion(this.PC);
    })
    await this.ejecutarTareaService.ejecutarDelay(() => {
      this.elementoActivo = ElementoProcesador.IR;
    })
    await this.ejecutarTareaService.ejecutarDelay(() => {
      this.IR = this.MBR;
    })
    await this.ejecutarTareaService.ejecutarDelay(() => {
      this.elementoActivo = ElementoProcesador.UNIDAD_CONTROL;
    })
    await this.ejecutarTareaService.ejecutarDelay(async () => {
      await this.ejecutarInstruccion();
    })
    await this.ejecutarTareaService.ejecutarDelay(() => {
      this.elementoActivo = ElementoProcesador.UNIDAD_CONTROL;
    })
    if (this.hayLineaPorEjecutar()) {
      this.PC++;
      this.ejecutarInstruccionesGuardadas();
    }
  }

  /**
   * Toma la operación a realizar y realizaz la ejecución de la instrucción 
   * @returns void
   */
  private async ejecutarInstruccion(): Promise<void> {
    if (this.IR == undefined) {
      return;
    }
    const operacion = this.IR.operacion;
    const operando1: number | VariableInstruccion | undefined = this.IR.operando1;
    const operando2: number | VariableInstruccion | undefined = this.IR.operando2;
    const operando3: number | VariableInstruccion | undefined = this.IR.operando3;

    switch (operacion) {
      case OperacionInstruccion.LOAD:
        await this.ejecutarInstruccionLoad(operando1, operando2);
        break;
      case OperacionInstruccion.ADD:
        await this.ejecutarInstruccionMatematica(OperacionInstruccion.ADD, operando1, operando2, operando3);
        break;
      case OperacionInstruccion.SUB:
        await this.ejecutarInstruccionMatematica(OperacionInstruccion.SUB, operando1, operando2, operando3);
        break;
      case OperacionInstruccion.MUL:
        await this.ejecutarInstruccionMatematica(OperacionInstruccion.MUL, operando1, operando2, operando3);
        break;
      case OperacionInstruccion.DIV:
        await this.ejecutarInstruccionMatematica(OperacionInstruccion.DIV, operando1, operando2, operando3);
        break;
      case OperacionInstruccion.MOVE:
        await this.ejecutarInstruccionMove(operando1, operando2);
        break;
      case OperacionInstruccion.JUMP:
        await this.ejecutarInstruccionJump(operando1);
        break;
      default:
        break;
    }
  }

  /**
   * Ejecuta la instrucción JUMP
   * @param numero  Número de la instrucción a la que se va a saltar
   * @returns void
   */
  private async ejecutarInstruccionJump(numero: number | VariableInstruccion | undefined): Promise<void> {
    if (numero == undefined || numero > this.memoria.celdas.length) {
      return;
    }
    await this.ejecutarTareaService.ejecutarDelay(() => {
      this.elementoActivo = ElementoProcesador.PC;
    })
    await this.ejecutarTareaService.ejecutarDelay(() => {
      this.PC = numero-1;

    }) 
  }

  /**
   * Ejecuta la instrucción LOAD
   * @param variableAGuardar Variable donde se guardará el valor cargado
   * @param numero Número o variable de la instrucción a cargar
   * @returns void
   */
  private async ejecutarInstruccionLoad(variableAGuardar: number | VariableInstruccion | undefined, numero: number | VariableInstruccion | undefined): Promise<void> {
    if (variableAGuardar == undefined || numero == undefined) {
      return;
    }
    await this.ejecutarTareaService.ejecutarDelay(() => {
      this.elementoActivo = ElementoProcesador.ALMACEN_GENERAL;
    })
    await this.ejecutarTareaService.ejecutarDelay(() => {
      switch(variableAGuardar) {
        case VariableInstruccion.A:
          this.registros.A = numero;
          break;
        case VariableInstruccion.B:
          this.registros.B = numero;
          break;
        case VariableInstruccion.C:
          this.registros.C = numero;
          break;
        case VariableInstruccion.D:
          this.registros.D = numero;
          break;
        case VariableInstruccion.E:
          this.registros.E = numero;
          break;
        case VariableInstruccion.F:
          this.registros.F = numero;
          break;
        case VariableInstruccion.G:
          this.registros.G = numero;
          break;
        case VariableInstruccion.H:
          this.registros.H = numero;
          break;
        default:
          break;
      }
    })
  }

  /**
   *  Ejecuta una instrucción matemática
   * @param tipoOperacion  Tipo de operación a realizar
   * @param primeraVariable 
   * @param segundaVariable 
   * @param variableDestino 
   * @returns 
   */
  private async ejecutarInstruccionMatematica(tipoOperacion: OperacionInstruccion, primeraVariable: number | VariableInstruccion | undefined, segundaVariable: number | VariableInstruccion | undefined, variableDestino: number | VariableInstruccion | undefined): Promise<void> {
    if (primeraVariable == undefined || segundaVariable == undefined) {
      return;
    }
    switch(variableDestino) {
      case VariableInstruccion.A:
        this.registros.A = await this.ejecutarOperacionALU(tipoOperacion, primeraVariable, segundaVariable);
        break;
      case VariableInstruccion.B:
        this.registros.B = await this.ejecutarOperacionALU(tipoOperacion, primeraVariable, segundaVariable);
        break;
      case VariableInstruccion.C:
        this.registros.C = await this.ejecutarOperacionALU(tipoOperacion, primeraVariable, segundaVariable);
        break;
      case VariableInstruccion.D:
        this.registros.D = await this.ejecutarOperacionALU(tipoOperacion, primeraVariable, segundaVariable);
        break;
      case VariableInstruccion.E:
        this.registros.E = await this.ejecutarOperacionALU(tipoOperacion, primeraVariable, segundaVariable);
        break;
      case VariableInstruccion.F:
        this.registros.F = await this.ejecutarOperacionALU(tipoOperacion, primeraVariable, segundaVariable);
        break;
      case VariableInstruccion.G:
        this.registros.G = await this.ejecutarOperacionALU(tipoOperacion, primeraVariable, segundaVariable);
        break;
      case VariableInstruccion.H:
        this.registros.H = await this.ejecutarOperacionALU(tipoOperacion, primeraVariable, segundaVariable);
        break;
      default:
        break;
    }
  }

  /**
   *  Ejecuta una operación en la ALU
   * @param operacion  Operación a realizar
   * @param operando1 
   * @param operando2 
   * @returns number 
   */
  private async ejecutarOperacionALU(operacion: OperacionInstruccion, operando1: number | VariableInstruccion | undefined, operando2: number | VariableInstruccion | undefined): Promise<number> {
    if (operando1 == undefined || operando2 == undefined) {
      return 0;
    }
    await this.ejecutarTareaService.ejecutarDelay(() => {
      this.elementoActivo = ElementoProcesador.ALU;
    })
    await this.ejecutarTareaService.ejecutarDelay(() => {
      this.elementoActivo = ElementoProcesador.ALMACEN_GENERAL;
    })
    const numero1 = this.obtenerValorAlmacenGeneral(operando1);
    const numero2 = this.obtenerValorAlmacenGeneral(operando2);
    const resultadoOperacion = this.ALU.ejecutarOperacion(operacion, numero1, numero2);
    return resultadoOperacion;
  }

  /**
   * Obtiene el valor de una variable en el almacen general
   * @param variableAObtener Variable a obtener
   * @returns number
   */
  private obtenerValorAlmacenGeneral(variableAObtener: number | VariableInstruccion | undefined) {
    if (variableAObtener == undefined) {
      return 0;
    }
    switch(variableAObtener) {
      case VariableInstruccion.A:
        return this.registros.A;
      case VariableInstruccion.B:
        return this.registros.B;
      case VariableInstruccion.C:
        return this.registros.C;
      case VariableInstruccion.D:
        return this.registros.D;
      case VariableInstruccion.E:
        return this.registros.E;
      case VariableInstruccion.F:
        return this.registros.F;
      case VariableInstruccion.G:
        return this.registros.G;
      case VariableInstruccion.H:
        return this.registros.H;
      default:
        return 0;
    }
  }

  /**
   *  Ejecuta la instrucción MOVE
   * @param variableOrigen Variable de origen
   * @param variableDestino Variable de destino
   * @returns void
   */
  private async ejecutarInstruccionMove(variableOrigen: number | VariableInstruccion | undefined, variableDestino: number | VariableInstruccion | undefined): Promise<void> {
    if (variableOrigen == undefined || variableDestino == undefined) {
      return;
    }
    await this.ejecutarTareaService.ejecutarDelay(() => {
      this.elementoActivo = ElementoProcesador.ALMACEN_GENERAL;
    })
    switch(variableDestino) {
      case VariableInstruccion.A:
        this.registros.A = this.obtenerValorAlmacenGeneral(variableOrigen);
        break;
      case VariableInstruccion.B:
        this.registros.B = this.obtenerValorAlmacenGeneral(variableOrigen);
        break;
      case VariableInstruccion.C:
        this.registros.C = this.obtenerValorAlmacenGeneral(variableOrigen);
        break;
      case VariableInstruccion.D:
        this.registros.D = this.obtenerValorAlmacenGeneral(variableOrigen);
        break;
      case VariableInstruccion.E:
        this.registros.E = this.obtenerValorAlmacenGeneral(variableOrigen);
        break;
      case VariableInstruccion.F:
        this.registros.F = this.obtenerValorAlmacenGeneral(variableOrigen);
        break;
      case VariableInstruccion.G:
        this.registros.G = this.obtenerValorAlmacenGeneral(variableOrigen);
        break;
      case VariableInstruccion.H:
        this.registros.H = this.obtenerValorAlmacenGeneral(variableOrigen);
        break;
      default:
        break;
    }
  }


  get habilitarBtnEjecutar(): boolean {
    return this.estadoComputador == EstadoComputador.SIN_INICIAR;
  }

  get habilitarBtnPausar(): boolean {
    return this.estadoComputador == EstadoComputador.EN_EJECUCION;
  }

  get habilitarBtnReanudar(): boolean {
    return this.estadoComputador == EstadoComputador.PAUSADO;
  }

  get unidadControlEstaActiva(): boolean {
    return this.elementoActivo == ElementoProcesador.UNIDAD_CONTROL;
  }

  get memoriaEstaActiva(): boolean {
    return this.elementoActivo == ElementoProcesador.MEMORIA;
  }

  get aluEstaActiva(): boolean {
    return this.elementoActivo == ElementoProcesador.ALU;
  }

  get almacenGeneralEstaActivo(): boolean {
    return this.elementoActivo == ElementoProcesador.ALMACEN_GENERAL;
  }

  get pcEstaActivo(): boolean {
    return this.elementoActivo == ElementoProcesador.PC;
  }

  get marEstaActivo(): boolean {
    return this.elementoActivo == ElementoProcesador.MAR;
  }

  get mbrEstaActivo(): boolean {
    return this.elementoActivo == ElementoProcesador.MBR;
  }

  get irEstaActivo(): boolean {
    return this.elementoActivo == ElementoProcesador.IR;
  }

  get busDatosEstaActivo(): boolean {
    return this.elementoActivo == ElementoProcesador.BUS_DATOS;
  }

  get busDireccionesEstaActivo(): boolean {
    return this.elementoActivo == ElementoProcesador.BUS_DIRECCIONES;
  }

  get busControlEstaActivo(): boolean {
    return this.elementoActivo == ElementoProcesador.BUS_CONTROL;
  }
}
