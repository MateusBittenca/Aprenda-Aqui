import { BadRequestException, Injectable } from '@nestjs/common';
import { ExerciseType } from '@prisma/client';
import { runInNewContext } from 'vm';

export type SubmitPayload = {
  selectedIndex?: number;
  blanks?: Record<string, string>;
  code?: string;
};

@Injectable()
export class ExerciseEvaluatorService {
  evaluate(
    type: ExerciseType,
    payload: unknown,
    submit: SubmitPayload,
  ): { correct: boolean; detail?: string } {
    if (type === ExerciseType.MULTIPLE_CHOICE) {
      return this.evalMc(payload as { correctIndex: number }, submit);
    }
    if (type === ExerciseType.CODE_FILL) {
      return this.evalFill(
        payload as { blanks: { id: string; answer: string }[] },
        submit,
      );
    }
    if (type === ExerciseType.CODE_EDITOR) {
      return this.evalEditor(
        payload as { tests: { expected: string }[]; language: string },
        submit,
      );
    }
    throw new BadRequestException('Tipo de exercício inválido');
  }

  private evalMc(payload: { correctIndex: number }, submit: SubmitPayload) {
    if (typeof submit.selectedIndex !== 'number') {
      return { correct: false, detail: 'Informe selectedIndex' };
    }
    return { correct: submit.selectedIndex === payload.correctIndex };
  }

  private evalFill(
    payload: { blanks: { id: string; answer: string }[] },
    submit: SubmitPayload,
  ) {
    if (!submit.blanks || typeof submit.blanks !== 'object') {
      return { correct: false, detail: 'Informe blanks' };
    }
    for (const b of payload.blanks) {
      const got = submit.blanks[b.id]?.trim().toLowerCase() ?? '';
      const exp = b.answer.trim().toLowerCase();
      if (got !== exp) {
        return { correct: false };
      }
    }
    return { correct: true };
  }

  private evalEditor(
    payload: { tests: { expected: string }[]; language: string },
    submit: SubmitPayload,
  ) {
    if (payload.language !== 'javascript') {
      return { correct: false, detail: 'Apenas JavaScript no MVP' };
    }
    const code = submit.code?.trim() ?? '';
    if (!code.length) {
      return { correct: false, detail: 'Informe code' };
    }
    if (code.length > 4000) {
      return { correct: false, detail: 'Código muito longo' };
    }
    let result: unknown;
    try {
      const wrapped = `"use strict"; return (${code});`;
      result = runInNewContext(wrapped, Object.create(null), { timeout: 400 });
    } catch {
      return { correct: false, detail: 'Erro ao executar o código' };
    }
    const normalized = this.normalizeExpected(result);
    for (const t of payload.tests) {
      if (normalized !== t.expected.trim()) {
        return { correct: false };
      }
    }
    return { correct: true };
  }

  private normalizeExpected(value: unknown): string {
    if (typeof value === 'string') return value;
    return JSON.stringify(value);
  }
}
