"use client";

import { type Question } from "@prisma/client";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { IoIosAddCircleOutline } from "react-icons/io";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import QuestionCard from "@/components/studentForm/Question";
import QuestionInput from "@/components/addForm/QuestionInput";
import { question } from "@/utils/types";

// Client-side ids are for React keys and local editing only — updateForm mints
// the real question id server-side so a stale or duplicated id can never
// collide with an existing question.
const createQuestion = (): question => ({
  id: uuidv4(),
  question: "",
  showInTeacherExport: true,
  options: [
    { id: uuidv4(), text: "", code: 1 },
    { id: uuidv4(), text: "", code: 2 },
  ],
  name: "",
  matrixGroup: "",
});

const EditQuestionsPanel = ({
  initialQuestions,
  counterpartType,
  answeredQuestionIds,
}: {
  initialQuestions: Question[];
  counterpartType: "pre" | "post" | null;
  answeredQuestionIds: string[];
}) => {
  const answered = new Set(answeredQuestionIds);
  const [questions, setQuestions] = useState(initialQuestions);
  const [newQuestions, setNewQuestions] = useState<question[]>([]);
  const [mirror, setMirror] = useState(true);

  const updateMatrixGroup = (id: string, value: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, matrixGroup: value || null } : q
      )
    );
  };

  const updateQuestionText = (id: string, value: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, question: value } : q))
    );
  };

  const updateOptionText = (questionId: string, optionIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        const newOptions = q.options.map((opt, i) =>
          i === optionIndex ? { ...opt, text: value } : opt
        );
        return { ...q, options: newOptions };
      })
    );
  };

  const updateOptionCode = (
    questionId: string,
    optionIndex: number,
    value: number
  ) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        const newOptions = q.options.map((opt, i) =>
          i === optionIndex ? { ...opt, code: value } : opt
        );
        return { ...q, options: newOptions };
      })
    );
  };

  const addNewQuestion = () =>
    setNewQuestions((prev) => [...prev, createQuestion()]);

  const updateNewQuestion = (
    id: string,
    text: string,
    showInTeacherExport: boolean,
    name: string,
    matrixGroup?: string
  ) =>
    setNewQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
              ...q,
              question: text,
              showInTeacherExport,
              name,
              matrixGroup: matrixGroup ?? q.matrixGroup,
            }
          : q
      )
    );

  const deleteNewQuestion = (id: string) =>
    setNewQuestions((prev) => prev.filter((q) => q.id !== id));

  const addNewOption = (questionId: string) =>
    setNewQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: [
                ...q.options,
                { id: uuidv4(), text: "", code: q.options.length + 1 },
              ],
            }
          : q
      )
    );

  const updateNewOption = (
    questionId: string,
    optionId: string,
    text: string,
    code: number
  ) =>
    setNewQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((o) =>
                o.id === optionId ? { ...o, text, code } : o
              ),
            }
          : q
      )
    );

  const deleteNewOption = (questionId: string, optionId: string) =>
    setNewQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId && q.options.length > 2
          ? { ...q, options: q.options.filter((o) => o.id !== optionId) }
          : q
      )
    );

  return (
    <>
      <Input
        type="hidden"
        name="questions"
        value={JSON.stringify(questions)}
        readOnly
      />
      <Input
        type="hidden"
        name="newQuestions"
        value={JSON.stringify(newQuestions)}
        readOnly
      />
      <Input
        type="hidden"
        name="mirrorNewQuestions"
        value={mirror ? "true" : "false"}
        readOnly
      />
      {questions.map((question) => (
        <QuestionCard key={question.id} question={question} disabled>
          <div className="border-t pt-3 space-y-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Question Text</Label>
              <Input
                value={question.question}
                onChange={(e) => updateQuestionText(question.id, e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                {answered.has(question.id)
                  ? "Options (codes are locked — this question already has responses)"
                  : "Options (no responses yet, so codes can still be changed)"}
              </Label>
              <div className="space-y-1.5">
                {question.options.map((opt, i) => (
                  <div key={i} className="grid grid-cols-[1fr_auto] gap-2 items-center">
                    <Input
                      value={opt.text}
                      onChange={(e) => updateOptionText(question.id, i, e.target.value)}
                    />
                    {answered.has(question.id) ? (
                      <span className="text-xs text-muted-foreground w-20 text-right">
                        code: {opt.code}
                      </span>
                    ) : (
                      <Input
                        type="number"
                        aria-label="Option code"
                        className="w-20"
                        value={opt.code}
                        onChange={(e) =>
                          updateOptionCode(question.id, i, Number(e.target.value))
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Matrix Group</Label>
              <Input
                placeholder="Optional — same value groups questions into a matrix"
                value={question.matrixGroup ?? ""}
                onChange={(e) => updateMatrixGroup(question.id, e.target.value)}
              />
            </div>
          </div>
        </QuestionCard>
      ))}

      {newQuestions.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-medium">New questions</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Responses already collected will be blank for these questions, since
            they were not asked at the time.
          </p>
          {newQuestions.map((q) => (
            <QuestionInput
              key={q.id}
              question={q}
              updateQuestion={updateNewQuestion}
              deleteQuestion={deleteNewQuestion}
              addOption={addNewOption}
              updateOption={updateNewOption}
              deleteOption={deleteNewOption}
            />
          ))}
          {counterpartType && (
            <label className="mt-4 flex items-center gap-2 text-sm">
              <Checkbox
                checked={mirror}
                onCheckedChange={(checked) => setMirror(checked === true)}
              />
              Also add these to the matching {counterpartType}-survey
            </label>
          )}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        className="mt-4 w-full"
        onClick={addNewQuestion}
      >
        <IoIosAddCircleOutline /> Add question
      </Button>
    </>
  );
};

export default EditQuestionsPanel;
