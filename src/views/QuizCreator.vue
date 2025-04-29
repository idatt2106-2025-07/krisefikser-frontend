<!-- QuizCreator.vue -->
<template>
  <div class="quiz-creator">
    <h2>Quiz Creator</h2>

    <!-- ───── Create-question card ───── -->
    <Card>
      <template #content>
        <h3>Create New Question</h3>

        <!-- Question text -->
        <div class="field">
          <label for="questionText">Question Text</label>
          <InputText
            id="questionText"
            v-model="newQuestion.text"
            placeholder="Enter question text"
          />
        </div>

        <!-- Add option -->
        <div class="field option-field">
          <label for="newOption">Add Option</label>
          <InputText
            id="newOption"
            v-model="newOption"
            placeholder="Enter option text"
            class="flex-1"
          />
          <Button icon="pi pi-plus" label="Add" class="ml-2" @click="addOption" />
        </div>

        <!-- Current options -->
        <div v-if="newQuestion.options.length" class="options-list">
          <ul>
            <li v-for="(opt, idx) in newQuestion.options" :key="idx">{{ idx + 1 }}. {{ opt }}</li>
          </ul>
        </div>

        <!-- Correct answer dropdown -->
        <div v-if="newQuestion.options.length" class="field">
          <label for="correctAnswer">Correct Answer</label>
          <Dropdown
            id="correctAnswer"
            v-model="newQuestion.correctAnswerIndex"
            :options="answerOptions"
            placeholder="Select correct answer"
          />
        </div>

        <!-- Action buttons -->
        <div class="btn-group">
          <Button label="Add Question" @click="addQuestion" />
          <Button label="Reset" severity="secondary" class="ml-2" @click="resetNewQuestion" />
        </div>
      </template>
    </Card>

    <!-- ───── Added questions list ───── -->
    <section class="questions-list" v-if="questions.length">
      <h3 class="mt-4">Questions</h3>
      <div v-for="q in questions" :key="q.id" class="mb-3">
        <Card>
          <template #content>
            <h4>{{ q.text }}</h4>
            <ul>
              <li v-for="(opt, idx) in q.options" :key="idx">
                <span v-if="q.correctAnswerIndex === idx" class="correct-icon"> ✔ </span>
                {{ idx + 1 }}. {{ opt }}
              </li>
            </ul>
          </template>
        </Card>
      </div>
    </section>

    <p v-else class="mt-4">No questions added yet.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Dropdown from 'primevue/dropdown'

interface Question {
  id: number
  text: string
  options: string[]
  correctAnswerIndex: number | null
}

/* ───── State ───── */
const questions = ref<Question[]>([])

const newQuestion = ref<Question>({
  id: 0,
  text: '',
  options: [],
  correctAnswerIndex: null,
})
const newOption = ref('')

/* ───── Computed ───── */
const answerOptions = computed(() =>
  newQuestion.value.options.map((opt, idx) => ({
    label: opt,
    value: idx,
  })),
)

/* ───── Methods ───── */
function addOption() {
  const text = newOption.value.trim()
  if (!text) return
  newQuestion.value.options.push(text)
  newOption.value = ''
}

function addQuestion() {
  const q = newQuestion.value
  if (!q.text.trim() || q.options.length < 2 || q.correctAnswerIndex === null) {
    alert('Please enter a question, add at least two options, and choose the correct answer.')
    return
  }
  questions.value.push({ ...q, id: Date.now() })
  resetNewQuestion()
}

function resetNewQuestion() {
  newQuestion.value = { id: 0, text: '', options: [], correctAnswerIndex: null }
  newOption.value = ''
}
</script>

<style scoped>
.quiz-creator {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.field {
  margin-bottom: 1rem;
}

.option-field {
  display: flex;
  align-items: center;
}

.options-list ul {
  padding-left: 1.25rem;
}

.btn-group {
  display: flex;
  margin-top: 1rem;
}

.correct-icon {
  color: var(--green-600);
  font-weight: 700;
  margin-right: 0.25rem;
}

/* Small utility margins (PrimeFlex v3 classes) */
.mt-4 {
  margin-top: 1rem;
}
.mb-3 {
  margin-bottom: 0.75rem;
}
.ml-2 {
  margin-left: 0.5rem;
}
</style>
