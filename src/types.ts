export type Fragment = {
	begin: number;
	end: number;
};

export type ClonePair = {
	id: number;
	f: Fragment;
	paired: Fragment;
};
