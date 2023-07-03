import React from "react";
import Tabs from '../../components/tabs';
import UpdateFromDb from "../UpdateFromDb";
import UpdateFromFile from "../UpdateFromFile";

const ApplyChanges = () => {
  const tabs = [
    {
      title: 'Apply diffs from main database',
      content: <UpdateFromDb />,
    },
    {
      title: 'Update from file',
      content: <UpdateFromFile />,
    },
  ];


  return (
    <div>
      <Tabs tabs={tabs} />
    </div>
  );
};

export default ApplyChanges;
