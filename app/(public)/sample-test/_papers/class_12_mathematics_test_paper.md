---
type: MCQ_S
correct_marks: 4
wrong_marks: 1
correct_option: B
---
Let $A$ be a square matrix of order 3 such that $|A| = 5$. Find the value of $|adj(A)|$.

A) 5
B) 25
C) 125
D) 625

### Solution
For any square matrix $A$ of order $n$, the determinant of its adjoint is given by the formula:
$$|adj(A)| = |A|^{n-1}$$
Given that $n = 3$ and $|A| = 5$:
$$|adj(A)| = 5^{3-1} = 5^2 = 25$$

===QUESTION_BOUNDARY===

---
type: MCQ_S
correct_marks: 4
wrong_marks: 1
correct_option: A
---
Find the value of the limit:
$$\lim_{x \to 0} \frac{\sin(5x)}{x}$$

A) 5
B) 1
C) 0
D) $\frac{1}{5}$

### Solution
Using the standard limit formula $\lim_{\theta \to 0} \frac{\sin\theta}{\theta} = 1$:
$$\lim_{x \to 0} \frac{\sin(5x)}{x} = \lim_{x \to 0} 5 \cdot \frac{\sin(5x)}{5x} = 5 \cdot 1 = 5$$

===QUESTION_BOUNDARY===

---
type: MCQ_S
correct_marks: 4
wrong_marks: 1
correct_option: C
---
Evaluate the indefinite integral:
$$\int e^x (\sin x + \cos x) dx$$

A) $e^x \cos x + C$
B) $-e^x \sin x + C$
C) $e^x \sin x + C$
D) $e^x (\sin x - \cos x) + C$

### Solution
Using the standard integral form:
$$\int e^x (f(x) + f'(x)) dx = e^x f(x) + C$$
Here, let $f(x) = \sin x$, then $f'(x) = \cos x$. 
Therefore, the integral is $e^x \sin x + C$.

===QUESTION_BOUNDARY===

---
type: MCQ_M
correct_marks: 4
wrong_marks: 1
correct_options:
  - B
  - C
---
Let $\vec{a}$ and $\vec{b}$ be two non-zero vectors. Which of the following statements are mathematically correct?

A) If $\vec{a} \cdot \vec{b} = 0$, then $\vec{a}$ must be parallel to $\vec{b}$.
B) If $\vec{a} \times \vec{b} = \vec{0}$, then $\vec{a}$ is parallel to $\vec{b}$.
C) If $\vec{a} \cdot \vec{b} = 0$, then $\vec{a}$ is perpendicular to $\vec{b}$.
D) The cross product vector $\vec{a} \times \vec{b}$ is parallel to both $\vec{a}$ and $\vec{b}$.

### Solution
- The dot product $\vec{a} \cdot \vec{b} = |\vec{a}||\vec{b}|\cos\theta$. If $\vec{a} \cdot \vec{b} = 0$ for non-zero vectors, then $\cos\theta = 0 \implies \theta = 90^\circ$ (perpendicular).
- The cross product $\vec{a} \times \vec{b} = |\vec{a}||\vec{b}|\sin\theta \hat{n}$. If $\vec{a} \times \vec{b} = \vec{0}$ for non-zero vectors, then $\sin\theta = 0 \implies \theta = 0^\circ$ or $180^\circ$ (parallel).
- The vector $\vec{a} \times \vec{b}$ is perpendicular to both $\vec{a}$ and $\vec{b}$.

===QUESTION_BOUNDARY===

---
type: MCQ_S
correct_marks: 4
wrong_marks: 1
correct_option: D
---
An urn contains 6 red and 4 black balls. Two balls are drawn at random one by one without replacement. What is the probability that both drawn balls are red?

A) $\frac{9}{25}$
B) $\frac{1}{3}$
C) $\frac{3}{10}$
D) $\frac{1}{3}$

### Solution
Total number of balls = 10.
Probability that the first ball is red, $P(R_1) = \frac{6}{10} = \frac{3}{5}$.
Since the draw is without replacement, the remaining balls = 9 (5 red, 4 black).
Probability that the second ball is red given first is red, $P(R_2 | R_1) = \frac{5}{9}$.
The joint probability:
$$P(R_1 \cap R_2) = P(R_1) \cdot P(R_2 | R_1) = \frac{3}{5} \times \frac{5}{9} = \frac{3}{9} = \frac{1}{3}$$

===QUESTION_BOUNDARY===

---
type: MCQ_S
correct_marks: 4
wrong_marks: 1
correct_option: A
---
Find the order and degree of the following differential equation:
$$\left(\frac{d^2 y}{dx^2}\right)^3 + \left(\frac{dy}{dx}\right)^2 + \sin\left(\frac{dy}{dx}\right) = 0$$

A) Order = 2, Degree = Not defined
B) Order = 2, Degree = 3
C) Order = 1, Degree = 2
D) Order = 2, Degree = 1

### Solution
- The highest order derivative present in the equation is $\frac{d^2 y}{dx^2}$, which is of second order. Thus, Order = 2.
- The equation is not a polynomial in terms of its derivatives because of the term $\sin\left(\frac{dy}{dx}\right)$. Therefore, the degree of this differential equation is not defined.

===QUESTION_BOUNDARY===

---
type: NUM_U
correct_marks: 4
wrong_marks: 0
num_exact: 12
---
If the vectors $\vec{a} = 2\hat{i} - 3\hat{j} + 4\hat{k}$ and $\vec{b} = \lambda\hat{i} + 6\hat{j} - 8\hat{k}$ are collinear (parallel), determine the exact numerical value of $\lambda$. (Note: Enter negative values with a leading minus sign if applicable).

### Solution
For two vectors to be collinear, their corresponding components must be proportional:
$$\frac{a_x}{b_x} = \frac{a_y}{b_y} = \frac{a_z}{b_z}$$
Substitute the given values:
$$\frac{2}{\lambda} = \frac{-3}{6} = \frac{4}{-8}$$
We see that the ratio is $-\frac{1}{2}$.
$$\frac{2}{\lambda} = -\frac{1}{2} \implies \lambda = -4$$

===QUESTION_BOUNDARY===

---
type: NUM_R
correct_marks: 4
wrong_marks: 0
num_min: 0.33
num_max: 0.34
---
Evaluate the definite integral:
$$\int_0^1 x^2 dx$$

### Solution
The antiderivative of $x^2$ is $\frac{x^3}{3}$. Applying the limits:
$$\int_0^1 x^2 dx = \left[ \frac{x^3}{3} \right]_0^1 = \frac{1^3}{3} - 0 = \frac{1}{3} \approx 0.3333$$
The accepted range is 0.33 to 0.34.

===QUESTION_BOUNDARY===

---
type: MCQ_M
correct_marks: 4
wrong_marks: 1
correct_options:
  - A
  - B
  - C
---
Which of the following relations $R$ defined on the set of all integers $\mathbb{Z}$ represent an equivalence relation?

A) $R = \{(a, b) : a - b \text{ is divisible by 5}\}$
B) $R = \{(a, b) : a = b\}$
C) $R = \{(a, b) : a + b \text{ is an even integer}\}$
D) $R = \{(a, b) : a \le b\}$

### Solution
An equivalence relation must be Reflexive, Symmetric, and Transitive:
- **Option A**: Divisibility of differences is reflexive ($a-a=0$, divisible by 5), symmetric (if $a-b$ is divisible, so is $b-a$), and transitive (if $a-b=5k$ and $b-c=5m$, then $a-c=5(k+m)$). This is an equivalence relation.
- **Option B**: Equality relation is always reflexive, symmetric, and transitive. This is an equivalence relation.
- **Option C**: $a+a = 2a$ is always even (Reflexive). If $a+b$ is even, $b+a$ is even (Symmetric). If $a+b$ and $b+c$ are even, then $a$ and $b$ have the same parity, and $b$ and $c$ have the same parity, which means $a$ and $c$ have the same parity $\implies a+c$ is even (Transitive). This is an equivalence relation.
- **Option D**: $a \le b$ is reflexive and transitive but not symmetric (e.g., $1 \le 2$ but $2 \not\le 1$). This is not an equivalence relation.

===QUESTION_BOUNDARY===

---
type: MCQ_S
correct_marks: 4
wrong_marks: 1
correct_option: B
---
Find the principal value of:
$$\sin^{-1}\left(\sin\frac{2\pi}{3}\right)$$

A) $\frac{2\pi}{3}$
B) $\frac{\pi}{3}$
C) $-\frac{\pi}{3}$
D) $\frac{5\pi}{3}$

### Solution
The principal value branch of $\sin^{-1} x$ is $\left[-\frac{\pi}{2}, \frac{\pi}{2}\right]$.
Since $\frac{2\pi}{3}$ does not lie in this interval, we rewrite the term:
$$\sin\frac{2\pi}{3} = \sin\left(\pi - \frac{\pi}{3}\right) = \sin\frac{\pi}{3}$$
Therefore:
$$\sin^{-1}\left(\sin\frac{2\pi}{3}\right) = \sin^{-1}\left(\sin\frac{\pi}{3}\right) = \frac{\pi}{3}$$
This lies within the principal value interval.
