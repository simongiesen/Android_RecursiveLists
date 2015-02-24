package com.antoshkaplus.recursivelists;

import android.app.Activity;
import android.app.ActionBar;
import android.app.Fragment;
import android.app.ListActivity;
//import android.app.ListFragment;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.os.Bundle;
import android.view.ContextMenu;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.os.Build;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ListAdapter;
import android.widget.ListView;
import java.util.ArrayList;
import java.util.List;



public class MainActivity extends ListActivity {

    // should think about good naming of those variables
    public final static String EXTRA_PARENT_ID = "ExtraParentId";
    public RecursiveLists lists = RecursiveLists.getInstance();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (savedInstanceState == null) {

            Intent intent = getIntent();
            int parentId = intent.getIntExtra(EXTRA_PARENT_ID, lists.getRootId());
            List<Item> items = RecursiveLists.getInstance().getListItems(parentId);

            ArrayList<String> values = new ArrayList<>();
            for (int i = 0; i < 100; ++i) {
                values.add("tefjwofpqj[q");
            }

            ArrayAdapter<String> adapter = new ArrayAdapter<String>(this,
                    android.R.layout.simple_list_item_1, android.R.id.text1, values);
            setListAdapter(adapter);

            registerForContextMenu(getListView());
        }
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public void onCreateContextMenu(ContextMenu menu, View v, ContextMenu.ContextMenuInfo menuInfo) {
        super.onCreateContextMenu(menu, v, menuInfo);
        if (v == getListView()) {
            menu.add("Add New");
            // click on item // and not blank?
            if (true) menu.add("Remove");
            menu.add("Edit");
            // click on item and // 1 - parentId
            if (true && lists.getListItems(1).size() > 1) menu.add("Reposition");
            if (lists.getListItems(0).size() == 0) menu.add("Recurse");
        }
    }

    @Override
    public boolean onContextItemSelected(MenuItem item) {
        // can also change color of items around

        getActionBar().setBackgroundDrawable(new ColorDrawable(Color.RED));
        return super.onContextItemSelected(item);
    }


    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    @Override
    protected void onListItemClick(ListView l, View v, int position, long id) {
        super.onListItemClick(l, v, position, id);
        Intent intent = new Intent(this, MainActivity.class);
        intent.putExtra(EXTRA_PARENT_ID, id);
        startActivity(intent);
    }

}
