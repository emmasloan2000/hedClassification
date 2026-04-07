export const calculateClassification = (grades, rules) => {

    let level1Grades = [];
    let level2Grades = [];
    let level3Grades = [];


    grades.forEach(grade => {
        if (grade.level == 1) {
            level1Grades.push(grade)
        } else if (grade.level == 2) {
            level2Grades.push(grade)
        } else if (grade.level == 3) {
            level3Grades.push(grade)
        }

    });



    const processGrades = (gradeArray) => {

        let levelWeightedSum = 0;
        let totalLevelCredits = 0;
        let totalFailedCredits = 0;

        gradeArray.forEach(grade => {

            let finalMark;
            let isCompensatableFail = false;


            if (grade.is_resit == true && grade.mark >= 40) {
                finalMark = 40 * grade.credits;
            } else {
                finalMark = grade.mark * grade.credits;
            }

            if (grade.mark < 40) {
                totalFailedCredits += grade.credits;
            }


            levelWeightedSum += finalMark;
            totalLevelCredits += grade.credits;

        });

            const average = levelWeightedSum / totalLevelCredits || 1;

            gradeArray.forEach(grade => {

                if (grade.mark < 40 && grade.mark >= rules.min_compensation_mark &&
                    totalFailedCredits <= rules.max_failed_credits_allowed && average >= 40) {
                    grade.isCompensatableFail = true;
                } else {
                    grade.isCompensatableFail = false;
                }

        });

        return average;


    };


    const level1Average = processGrades(level1Grades);
    const level2Average = processGrades(level2Grades);
    const level3Average = processGrades(level3Grades);


    const totalAverage = (level1Average * rules.y1_weight) + (level2Average * rules.y2_weight) + (level3Average * rules.y3_weight);



    let proposedClassification = "";
    let isBorderline = false;

    if (rules.y1_weight == 0 && level1Average >= 40) {
        if (totalAverage >= 70) {
            proposedClassification = "First Class Honours (1st)"

        } else if (totalAverage >= 60 && totalAverage < 70) {
            proposedClassification = "Upper Second Class Honours (2:1)"

            if (totalAverage >= 69) {
                isBorderline = true;
            }
        } else if (totalAverage >= 50 && totalAverage < 60) {
            proposedClassification = "Lower Second Class Honours (2:2)"

            if (totalAverage >= 59) {
                isBorderline = true;
            }

        } else if (totalAverage >= 40 && totalAverage < 50) {
            proposedClassification = "Third Class Honours (3rd)"

            if (totalAverage >= 49) {
                isBorderline = true;
            }

        } else if (totalAverage < 40) {
            proposedClassification = "Fail"

            if (totalAverage >= 39) {
                isBorderline = true;
            }
        }
    }

    return {
        totalAverage: totalAverage.toFixed(2),
        proposedClassification,
        isBorderline,
        level1Average: level1Average.toFixed(1),
        level2Average: level2Average.toFixed(1),
        level3Average: level3Average.toFixed(1)
    };

}