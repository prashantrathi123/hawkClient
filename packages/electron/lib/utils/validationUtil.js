const { expect } = require('chai')

const getValueByPath = (obj, path) => {
    try {
        return path.split('.').reduce((acc, part) => {
            const match = part.match(/^(\w+)\[(\d+)\]$/);
            if (match) {
                const [, key, index] = match;
                return acc && acc[key] && acc[key][index];
            }
            return acc && acc[part];
        }, obj);
    } catch (error) {
        return path
    }

}

const operatorValidation = (operator, actualValue, expectedValue) => {
    // const expect = loadedExpect;
    let pass = true;
    let error = "";
    try {
        switch (operator) {
            case 'isGreaterThan':
                expect(Number(actualValue)).to.be.greaterThan(Number(expectedValue));
                break;
            case 'isGreaterThenOrEqual':
                expect(Number(actualValue)).to.be.at.least(Number(expectedValue));
                break;
            case 'isEqualTo':  // handle the legacy "equal" operator
                expect(actualValue.toString()).to.equal(expectedValue);
                break;
            case 'isNotEqualTo':
                expect(actualValue.toString()).to.not.equal(expectedValue);
                break;
            case 'isLessThen':
                expect(Number(actualValue)).to.be.lessThan(Number(expectedValue));
                break;
            case 'isLessThenOrEqual':
                expect(Number(actualValue)).to.be.at.most(Number(expectedValue));
                break;
            case 'in':
                expect(expectedValue).to.include(actualValue);
                break;
            case 'notIn':
                expect(expectedValue).to.not.include(actualValue);
                break;
            case 'contains':
                expect(actualValue).to.include(expectedValue);
                break;
            case 'notContains':
                expect(actualValue).to.not.include(expectedValue);
                break;
            case 'startWith':
                if (typeof actualValue === 'string' && typeof expectedValue === 'string') {
                    pass = actualValue.startsWith(expectedValue);
                    if (!pass) throw new Error(`${actualValue} does not start with ${expectedValue}`);
                } else {
                    throw new Error(`Both actualValue and expectedValue must be strings`);
                }
                // expect(actualValue).to.startWith(expectedValue);
                break;
            case 'endWith':
                if (typeof actualValue === 'string' && typeof expectedValue === 'string') {
                    pass = actualValue.endsWith(expectedValue);
                    if (!pass) throw new Error(`${actualValue} does not end with ${expectedValue}`);
                } else {
                    throw new Error(`Both actualValue and expectedValue must be strings`);
                }
                break;
            case 'matchesRegex':
                expect(actualValue).to.match(new RegExp(expectedValue));
                break;
            case 'notMatchesRegex':
                expect(actualValue).to.not.match(new RegExp(expectedValue));
                break;
            case 'between':
                const [min, max] = expectedValue.split(',').map(Number);
                expect(Number(actualValue)).to.be.within(min, max);
                break;
            case 'notBetween':
                const [minValue, maxValue] = expectedValue.split(',').map(Number);
                expect(Number(actualValue)).to.not.be.within(minValue, maxValue);
                break;
            case 'isEmpty':
                expect(actualValue.length).to.equal(0);
                break;
            case 'isUnDefined':
                expect(actualValue).to.be.undefined;
                break;
            case 'isNull':
                expect(actualValue).to.be.null;
                break;
            case 'isTrue':
                expect(actualValue).to.be.true;
                break;
            case 'isFalse':
                expect(actualValue).to.be.false;
                break;
            case 'isTypeOf':
                expect(typeof actualValue).to.equal(expectedValue);
                break;
            case 'isInstanceOf':
                expect(actualValue).to.be.instanceOf(global[expectedValue]);
                break;
            case 'isArray':
                expect(actualValue).to.be.an('array');
                break;
            case 'isObject':
                expect(actualValue).to.be.an('object').and.not.an('array').and.not.null;
                break;
            case 'isString':
                expect(actualValue).to.be.a('string');
                break;
            case 'isNumber':
                expect(actualValue).to.be.a('number');
                break;
            case 'isBoolean':
                expect(actualValue).to.be.a('boolean');
                break;
            case 'hasLength':
                expect(actualValue.length).to.equal(Number(expectedValue));
                break;
            default:
                pass = false;
                error = `Unknown operator: ${operator}`;
        }
    } catch (err) {
        pass = false;
        error = err.message;
    }

    return { pass, error };
}

const evaluateValidations = (response, validations) => {
    let tempResponse = { ...response };
    const results = validations.map(assert => {
        if (!assert.isChecked) {
            return { ...assert, result: 'unchecked' };
        }

        try {
            tempResponse.response.body = JSON.parse(tempResponse.response.body);
        } catch (error) {
            // console.log("error response.body")
        }
        const actualValue = getValueByPath(tempResponse, assert.assertVar);
        const expectedValue = assert.value;
        const operator = assert.operator;
        let { pass, error } = operatorValidation(operator, actualValue, expectedValue);

        return { ...assert, success: pass, error };
    });

    return results;
}

module.exports = {
    evaluateValidations
}