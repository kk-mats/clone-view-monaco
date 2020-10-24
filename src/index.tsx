import React from "react";
import ReactDOM from "react-dom";
import {
	BrowserRouter,
	Switch,
	Route,
	Link,
	useHistory,
	useLocation,
} from "react-router-dom";

import MonacoEditor, {
	MonacoEditorProps,
	EditorDidMount,
} from "react-monaco-editor";
import { Range, editor } from "monaco-editor";

import { Fragment, ClonePair } from "./types";
import { code } from "./code.ts";

const fragments: Record<string, Fragment> = {
	f1: { begin: 1, end: 5 },
	f2: { begin: 3, end: 10 },
	f3: { begin: 6, end: 15 },
	f4: { begin: 20, end: 30 },
	f5: { begin: 25, end: 35 },
	f6: { begin: 30, end: 40 },
};

const clonePairs: Record<string, ClonePair> = {
	0: { id: 0, f: fragments.f1, paired: fragments.f2 },
	1: { id: 1, f: fragments.f1, paired: fragments.f3 },
	2: { id: 2, f: fragments.f2, paired: fragments.f4 },
	3: { id: 3, f: fragments.f4, paired: fragments.f4 },
	4: { id: 4, f: fragments.f5, paired: fragments.f5 },
	5: { id: 5, f: fragments.f6, paired: fragments.f6 },
};

const options: Readonly<MonacoEditorProps["options"]> = {
	readOnly: true,
	automaticLayout: true,
};

type ViewProps = {
	className: string;
	selected: string | null;
};

const View: React.FunctionComponent<ViewProps> = React.memo(
	({ className, selected }) => {
		const [
			editor,
			setEditor,
		] = React.useState<editor.IStandaloneCodeEditor | null>(null);

		const [cpToDecoration, setCpToDecoration] = React.useState<
			Record<string, string>
		>({});

		const editorDidMount = React.useCallback<EditorDidMount>(
			(editor, monaco) => {
				setEditor(editor);

				const clonePairArray = Object.entries(clonePairs);

				// Add all decorations
				const decorations = clonePairArray.map(([key, { f }]) => ({
					range: new Range(f.begin, 1, f.end, 1),
					options: {
						isWholeLine: true,
						linesDecorationsClassName: "clone",
					},
				}));
				const cpToDecorationMap: Record<string, string> = {};

				editor
					.deltaDecorations([], decorations)
					.forEach((id, index) => {
						cpToDecorationMap[clonePairArray[index][0]] = id;
					});
				console.log(cpToDecorationMap);

				setCpToDecoration(cpToDecorationMap);
			},
			[setEditor]
		);

		const [oldSelected, setOldSelected] = React.useState<string | null>(
			null
		);

		React.useEffect(() => {
			if (editor && Object.keys(cpToDecoration).length > 0) {
				const next = { ...cpToDecoration };

				// highlight selected clone
				if (selected !== null) {
					const selectedDecorationId = cpToDecoration[selected];
					const { f } = clonePairs[selected];
					const [nextSelectedId] = editor.deltaDecorations(
						[selectedDecorationId],
						[
							{
								range: new Range(f.begin, 1, f.end, 1),
								options: {
									isWholeLine: true,
									linesDecorationsClassName: "selected clone",
								},
							},
						]
					);
					next[selected] = nextSelectedId;
				}

				if (oldSelected !== null) {
					const oldSelectedDecorationId = cpToDecoration[oldSelected];
					const { f } = clonePairs[oldSelected];
					// unhighlight previously selected clone
					const [nextOldSelectedId] = editor.deltaDecorations(
						[oldSelectedDecorationId],
						[
							{
								range: new Range(f.begin, 1, f.end, 1),
								options: {
									isWholeLine: true,
									linesDecorationsClassName: "clone",
								},
							},
						]
					);
					next[oldSelected] = nextOldSelectedId;
				}

				setCpToDecoration(next);
				console.log(next);
				setOldSelected(selected);
			}
		}, [editor, selected]);

		return (
			<div className={className}>
				<MonacoEditor
					language="java"
					value={code}
					options={options}
					editorDidMount={editorDidMount}
				/>
			</div>
		);
	}
);

type ListProps = {
	className: string;
	selected: string | null;
	setSelected: React.Dispatch<string | null>;
};

const CloneList: React.FunctionComponent<ListProps> = ({
	className,
	selected,
	setSelected,
}) => {
	const history = useHistory();
	const onChange: React.ChangeEventHandler<HTMLSelectElement> = React.useCallback(
		(event) => {
			const { value } = event.target;
			if (value === "") {
				setSelected(null);
				history.push(`/view`);
			} else {
				setSelected(value);
				history.push(`/view#${value}`);
			}
		},
		[setSelected]
	);
	return (
		<select
			className={className}
			value={selected || ""}
			onChange={onChange}
		>
			{Object.values(clonePairs).map(({ id, f }) => (
				<option key={id} value={id}>
					#{id}: Ln {f.begin}-{f.end}
				</option>
			))}
			<option value="">not selected</option>
		</select>
	);
};

const Index: React.FunctionComponent = () => {
	const { hash } = useLocation();
	const [selected, setSelected] = React.useState<string | null>(() =>
		hash.startsWith("#") ? hash.slice(1) : null
	);

	return (
		<>
			<Route exact path="/view">
				<div className="flex">
					<CloneList
						className="list"
						selected={selected}
						setSelected={setSelected}
					/>
					<View className="view" selected={selected} />
				</div>
			</Route>
			<Route path="/">
				<Link to="/view">View</Link>
			</Route>
		</>
	);
};

const Root: React.FunctionComponent = () => {
	return (
		<BrowserRouter>
			<Switch>
				<Index />
			</Switch>
		</BrowserRouter>
	);
};

ReactDOM.render(<Root />, document.getElementById("root"));
