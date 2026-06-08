# Question Bank Bulk Import Markdown Template

This document defines the exact formatting rules and provides templates for all 4 types of questions supported by the CrackNCET bulk import system. 
You can upload this template directly to any chat LLM (like Gemini, ChatGPT, Claude) to instruct it to generate new questions matching this structure perfectly.

---

## General Rules

1. **Separators**: Every question card MUST be separated by a line containing exactly:
   ```markdown
   ===QUESTION_BOUNDARY===
   ```
2. **YAML Frontmatter**: Every question card MUST start with a YAML block enclosed in `---` delimiters containing:
   - `type`: `MCQ_S`, `MCQ_M`, `NUM_U`, or `NUM_R`.
   - `correct_marks`: Score for correct answer (e.g. `4.00`).
   - `wrong_marks`: Penalty score (e.g. `1.00`).
   - Type-specific fields (e.g. `correct_option`, `correct_options`, `num_exact`, `num_min`, `num_max`, `partial_marks`).
3. **Question Text**: Write original English text directly under the frontmatter. LaTeX mathematical expressions are fully supported and should be enclosed in single dollar signs (`$f: \mathbb{R} \to \mathbb{R}$`) for inline math, or double dollar signs (`$$a^2 + b^2 = c^2$$`) for display math.
4. **Options block**: For MCQ types, options MUST start on new lines starting with `A) `, `B) `, `C) `, etc.
5. **Solution block**: A step-by-step explanation block can be added at the end by preceding it with a line containing exactly `### Solution`.

---

## 1. Single Correct Multiple Choice Question (MCQ_S)

```markdown
---
type: MCQ_S
correct_marks: 4.00
wrong_marks: 1.00
correct_option: C
---
What is the derivative of the function $f(x) = 3x^2 + 5x - 2$ with respect to $x$?

A) $6x - 2$

B) $3x + 5$

C) $6x + 5$

D) $6x^2 + 5$

### Solution
To find the derivative of $f(x) = 3x^2 + 5x - 2$, we apply the power rule $d/dx(x^n) = n x^{n-1}$:
1. The derivative of $3x^2$ is $3 \cdot 2x = 6x$.
2. The derivative of $5x$ is $5$.
3. The derivative of the constant $-2$ is $0$.
Summing these gives $f'(x) = 6x + 5$, which corresponds to Option C.
```

---

## 2. Multiple Correct Multiple Choice Question (MCQ_M)

```markdown
---
type: MCQ_M
correct_marks: 4.00
wrong_marks: 2.00
partial_marks: 1.00
correct_options:
  - A
  - C
---
Which of the following functions are continuous everywhere on the set of real numbers $\mathbb{R}$?

A) $f(x) = \sin(x)$

B) $g(x) = \tan(x)$

C) $h(x) = e^x$

D) $k(x) = \frac{1}{x}$

### Solution
Let's analyze each function:
1. $f(x) = \sin(x)$ is continuous for all $x \in \mathbb{R}$ (Option A is correct).
2. $g(x) = \tan(x)$ is discontinuous at $x = (n + 1/2)\pi$ for integers $n$.
3. $h(x) = e^x$ is continuous for all $x \in \mathbb{R}$ (Option C is correct).
4. $k(x) = 1/x$ is discontinuous at $x = 0$.
Therefore, the correct options are A and C.
```

---

## 3. Numerical (Exact Value) Question (NUM_U)

```markdown
---
type: NUM_U
correct_marks: 4.00
wrong_marks: 0.00
num_exact: 5.0
---
If the matrix $A = \begin{pmatrix} 2 & 3 \\ 1 & x \end{pmatrix}$ has a determinant of $7$, find the value of $x$.

### Solution
The determinant of a $2 \times 2$ matrix $\begin{pmatrix} a & b \\ c & d \end{pmatrix}$ is given by $ad - bc$.
For matrix $A$:
$$\det(A) = 2(x) - 3(1) = 2x - 3$$
Since we are given that $\det(A) = 7$:
$$2x - 3 = 7 \implies 2x = 10 \implies x = 5$$
Thus, the answer is exactly 5.0.
```

---

## 4. Numerical (Range) Question (NUM_R)

```markdown
---
type: NUM_R
correct_marks: 4.00
wrong_marks: 0.00
num_min: 3.14
num_max: 3.15
---
Find the value of the mathematical constant $\pi$ rounded to two decimal places.

### Solution
The constant $\pi$ represents the ratio of a circle's circumference to its diameter.
Its decimal expansion starts with $3.14159...$
Rounding to two decimal places gives $3.14$. The acceptable range for this numerical entry is between 3.14 and 3.15.
```

---

## Full Example of Combined File

To write a file containing multiple questions, join the templates using `===QUESTION_BOUNDARY===` as follows:

```markdown
---
type: MCQ_S
correct_marks: 4.00
wrong_marks: 1.00
correct_option: A
---
What is the sum of $5$ and $7$?

A) $12$

B) $10$

C) $11$

D) $13$

===QUESTION_BOUNDARY===

---
type: NUM_U
correct_marks: 4.00
wrong_marks: 0.00
num_exact: 10
---
Evaluate the limit: $\lim_{x \to 2} (3x + 4)$.

### Solution
Substitute $x = 2$ directly: $3(2) + 4 = 6 + 4 = 10$.
```
