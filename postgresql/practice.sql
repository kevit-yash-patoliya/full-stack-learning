
-- NTILE window function example

SELECT
    student,
    marks,
    NTILE(4) OVER (ORDER BY marks DESC) AS bucket
FROM students;