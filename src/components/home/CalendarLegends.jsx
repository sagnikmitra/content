const CalendarLegends = () => {
  return (
    <div className="font-outfit">
      <p className="font-semibold text-[#d4d4d4]">Content Types</p>

      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="aspect-square h-4 w-4 rounded-[3px] border border-[#365245] bg-[#203329]">
            &nbsp;
          </div>
          <p className="text-sm text-[#c9c9cc]">Static Post</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="aspect-square h-4 w-4 rounded-[3px] border border-[#3e4f5c] bg-[#25313a]">
            &nbsp;
          </div>
          <p className="text-sm text-[#c9c9cc]">Video/Reel</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="aspect-square h-4 w-4 rounded-[3px] border border-[#5b3a3a] bg-[#3a2525]">
            &nbsp;
          </div>
          <p className="text-sm text-[#c9c9cc]">Live Event</p>
        </div>
      </div>
    </div>
  );
};

export default CalendarLegends;
