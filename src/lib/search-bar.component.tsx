import { IconButton } from "@mui/material";
import { useState } from "react";
import { SearchOffRounded } from "@mui/icons-material";

// type SearchBarProps = {
//   setSearchQuery: (e: React.InputEvent<HTMLInputElement>) => void;
// };

interface queryParams {
  qry: string;
}

const SearchBar = ({ setSearchQuery }: any) => {
  const [query, setQuery] = useState<queryParams | null>({ qry: "" });

  console.log(query);

  function handleQueryChange1(e: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = e.target;
    console.log("Capcpity name :", name);
    console.log("Capcpity value :", value);

    // Update the form data state with the new value
    setQuery((prevData: queryParams | null | undefined) => {
      if (!prevData) {
        console.warn("No current branch data to update");
        return null;
      }

      return {
        ...prevData,
        [name]: value,
      };
    });

    // Keep this to force immediate network synchronization re-evaluations
    // setVersion(Date.now());
  }
  return (
    <div>
      <form>
        <input
          type="text"
          name="qry"
          value={query?.qry}
          onInput={(e) => setSearchQuery(e.target as any)}
          onChange={handleQueryChange1}
          placeholder="YYYY-MM-DD"
          className="w-[20%] border border-black ml-5 bg-white rounded-sm"
        />
        <IconButton type="submit" aria-label="search">
          <SearchOffRounded />
        </IconButton>
      </form>
    </div>
  );
};

export default SearchBar;
