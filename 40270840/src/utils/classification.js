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
        let dissertationFail = false;
        let word = "dissertation";

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

            if (grade.module_name && grade.module_name.toLowerCase().includes(word) && grade.mark < rules.dissertation_min_pass) {
                dissertationFail = true;
            }


            levelWeightedSum += finalMark;
            totalLevelCredits += grade.credits;

        });

        const average = levelWeightedSum / totalLevelCredits || 0;

        gradeArray.forEach(grade => {

            if (grade.mark < 40 && grade.mark >= rules.min_compensation_mark &&
                totalFailedCredits <= rules.max_failed_credits_allowed && average >= 40) {
                grade.isCompensatableFail = true;
            } else {
                grade.isCompensatableFail = false;
            }

        });



        return { average, dissertationFail, totalLevelCredits };


    };


    const level1Average = processGrades(level1Grades);
    const level2Average = processGrades(level2Grades);
    const level3Average = processGrades(level3Grades);
    const totalCredits = processGrades(grades).totalLevelCredits;


    const hasDissertationFail = level1Average.dissertationFail || level2Average.dissertationFail || level3Average.dissertationFail;


    const totalAverage = (level1Average.average * rules.y1_weight) + (level2Average.average * rules.y2_weight) + (level3Average.average * rules.y3_weight);



    let proposedClassification = "Fail";
    let isBorderline = false;

    const passedAllLevels = level1Average.average >= 40 && level2Average.average >= 40 && level3Average.average >= 40;

    if (totalCredits === 360) {


        if (passedAllLevels && !hasDissertationFail) {

            if (totalAverage >= 70) {
                proposedClassification = "First Class Honours"

            } else if (totalAverage >= 60 && totalAverage < 70) {
                proposedClassification = "Upper Second Class Honours"

                if (totalAverage >= 69) {
                    isBorderline = true;
                }
            } else if (totalAverage >= 50 && totalAverage < 60) {
                proposedClassification = "Lower Second Class Honours"

                if (totalAverage >= 59) {
                    isBorderline = true;
                }

            } else if (totalAverage >= 40 && totalAverage < 50) {
                proposedClassification = "Third Class Honours"

                if (totalAverage >= 49) {
                    isBorderline = true;
                }

            } else {
                proposedClassification = "Fail"

                if (totalAverage >= 39) {
                    isBorderline = true;
                }
            }
        }

    } else {
        proposedClassification = "Pending"
    }

    return {
        totalAverage: totalAverage.toFixed(2),
        proposedClassification,
        isBorderline,
        level1Average: level1Average.average.toFixed(1),
        level2Average: level2Average.average.toFixed(1),
        level3Average: level3Average.average.toFixed(1),
        hasDissertationFail,
        level1Grades,
        level2Grades,
        level3Grades
    };

}