import React from "react";
import ReactDOM from "react-dom";

import MonacoEditor, {MonacoEditorProps} from "react-monaco-editor";

const value=`List<Integer> numbers = List.of(3, 1, -4, 1, -5, 9, -2, 6, 5, 3, 5);

numbers.stream()
        .filter(new Predicate<Integer>() {
            @Override
            public boolean test(Integer number) {
                return Math.abs(number) >= 5;
            }
        })
        .forEach(new Consumer<Integer>() {
            @Override
            public void accept(Integer number) {
                System.out.println(number);
            }
        });`

const options: Readonly<MonacoEditorProps["options"]> = {
	readOnly: true
};


const Index: React.FunctionComponent = () => {
	return (
		<MonacoEditor 
		language="java"
		value={value}
		options={options}
		/>
	)
};

ReactDOM.render(<Index />, document.getElementById("root"));