defmodule <%= inspect context.web_module %>.<%= inspect Module.concat(schema.web_namespace, schema.alias) %>Controller do
  use <%= inspect context.web_module %>, :controller

  alias <%= inspect context.module %>
  alias <%= inspect schema.module %>

  def index(conn, params) do
    if Enum.any?(conn.path_info, fn x -> x == "api" end) do
      limit = String.to_integer(params["length"])
      offset = String.to_integer(params["start"])

      column_no = params["order"]["0"]["column"]
      key = params["columns"][column_no]["data"] |> String.to_atom()
      dir = params["order"]["0"]["dir"] |> String.to_atom()
      order_by = [{dir, key}]

      data =
        Repo.all(from(a in <%= inspect schema.alias %>, where: ilike(a.name, ^"%#{params["search"]["value"]}%")))

      data2 =
        Repo.all(
          from(
            a in <%= inspect schema.alias %>,
            where: ilike(a.name, ^"%#{params["search"]["value"]}%"),
            limit: ^limit,
            offset: ^offset,
            order_by: ^order_by
          )
        )
        |> Enum.map(fn x -> <%= inspect context.base_module %>.s_to_map(x) end)
      json =
      %{
        data: data2,
        recordsTotal: Enum.count(data2),
        recordsFiltered: Enum.count(data),
        draw: String.to_integer(params["draw"])
      }

    else
      <%= schema.plural %> = <%= inspect context.alias %>.list_<%= schema.plural %>()
      render(conn, "index.html", <%= schema.plural %>: <%= schema.plural %>)
    end 
  end

  def new(conn, _params) do
    changeset = <%= inspect context.alias %>.change_<%= schema.singular %>(%<%= inspect schema.alias %>{})
    render(conn, "new.html", changeset: changeset)
  end

  def create(conn, %{<%= inspect schema.singular %> => <%= schema.singular %>_params}) do
    if Enum.any?(conn.path_info, fn x -> x == "api" end) do
        if <%= schema.singular %>_params["id"] != nil do
          <%= schema.singular %> = <%= inspect context.alias %>.get_<%= schema.singular %>!( <%= schema.singular %>_params["id"] )
        
          if <%= schema.singular %> == nil do
              case <%= inspect context.alias %>.create_<%= schema.singular %>(<%= schema.singular %>_params) do
                {:ok, <%= schema.singular %>} ->
                  conn
                  |> put_resp_content_type("application/json")
                  |> send_resp(200, Poison.encode!(<%= inspect context.base_module %>.s_to_map(<%= schema.singular %>)))
                {:error, %Ecto.Changeset{} = changeset} ->
                  errors = changeset.errors |> Keyword.keys()

                  {reason, message} = changeset.errors |> hd()
                  {proper_message, message_list} = message
                  final_reason = Atom.to_string(reason) <> " " <> proper_message

                  conn
                  |> put_resp_content_type("application/json")
                  |> send_resp(500, Poison.encode!(%{status: final_reason}))
              end
          else
              case <%= inspect context.alias %>.update_<%= schema.singular %>(<%= schema.singular %>, <%= schema.singular %>_params) do
                {:ok, <%= schema.singular %>} ->
                  conn
                  |> put_resp_content_type("application/json")
                  |> send_resp(200, Poison.encode!(<%= inspect context.module %>.s_to_map(<%= schema.singular %>)))
                {:error, %Ecto.Changeset{} = changeset} ->
                  errors = changeset.errors |> Keyword.keys()

                  {reason, message} = changeset.errors |> hd()
                  {proper_message, message_list} = message
                  final_reason = Atom.to_string(reason) <> " " <> proper_message

                  conn
                  |> put_resp_content_type("application/json")
                  |> send_resp(500, Poison.encode!(%{status: final_reason}))
              end
          end 
        
        end 
    else
      case <%= inspect context.alias %>.create_<%= schema.singular %>(<%= schema.singular %>_params) do
        {:ok, <%= schema.singular %>} ->
          conn
          |> put_flash(:info, "<%= schema.human_singular %> created successfully.")
          |> redirect(to: <%= schema.route_helper %>_path(conn, :show, <%= schema.singular %>))
        {:error, %Ecto.Changeset{} = changeset} ->
          render(conn, "new.html", changeset: changeset)
      end
    end
  end

  def show(conn, %{"id" => id}) do
    <%= schema.singular %> = <%= inspect context.alias %>.get_<%= schema.singular %>!(id)
    render(conn, "show.html", <%= schema.singular %>: <%= schema.singular %>)
  end

  def edit(conn, %{"id" => id}) do
    <%= schema.singular %> = <%= inspect context.alias %>.get_<%= schema.singular %>!(id)
    changeset = <%= inspect context.alias %>.change_<%= schema.singular %>(<%= schema.singular %>)
    render(conn, "edit.html", <%= schema.singular %>: <%= schema.singular %>, changeset: changeset)
  end

  def update(conn, %{"id" => id, <%= inspect schema.singular %> => <%= schema.singular %>_params}) do
    <%= schema.singular %> = <%= inspect context.alias %>.get_<%= schema.singular %>!(id)

    case <%= inspect context.alias %>.update_<%= schema.singular %>(<%= schema.singular %>, <%= schema.singular %>_params) do
      {:ok, <%= schema.singular %>} ->
        conn
        |> put_flash(:info, "<%= schema.human_singular %> updated successfully.")
        |> redirect(to: <%= schema.route_helper %>_path(conn, :show, <%= schema.singular %>))
      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "edit.html", <%= schema.singular %>: <%= schema.singular %>, changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    <%= schema.singular %> = Repo.get(<%= inspect schema.alias %> , (id))

    if <%= schema.singular %> != nil do
        {:ok, _<%= schema.singular %>} = <%= inspect context.alias %>.delete_<%= schema.singular %>(<%= schema.singular %>)

      if Enum.any?(conn.path_info, fn x -> x == "api" end) do
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(200, Poison.encode!(%{status: "ok"}))
      else
        conn
        |> put_flash(:info, "<%= schema.human_singular %> deleted successfully.")
        |> redirect(to: <%= schema.route_helper %>_path(conn, :index))
      end
    else
      conn
      |> put_resp_content_type("application/json")
      |> send_resp(200, Poison.encode!(%{status: "already deleted"}))
    end
  end
end

    %Mix.Phoenix.Context{
      alias: Settings,
      base_module: Lha,
      basename: "settings",
      context_app: :lha,
      dir: "lib/lha/settings",
      file: "lib/lha/settings/settings.ex",
      generate?: true,
      module: Lha.Settings,
      name: "Settings",
      opts: [schema: true, context: true],
      schema: %Mix.Phoenix.Schema{
        alias: LocationMap,
        assocs: [],
        attrs: [
          floor_id: :integer,
          name: :string,
          polygon: :binary,
          barcode: :string,
          farm_id: :integer
        ],
        binary_id: nil,
        context_app: :lha,
        defaults: %{barcode: "", farm_id: "", floor_id: "", name: "", polygon: ""},
        embedded?: false,
        file: "lib/lha/settings/location_map.ex",
        generate?: true,
        human_plural: "Location maps",
        human_singular: "Location map",
        indexes: [],
        migration?: true,
        migration_defaults: %{barcode: "", farm_id: "", floor_id: "", name: "", polygon: ""},
        module: Lha.Settings.LocationMap,
        opts: [schema: true, context: true],
        params: %{
          create: %{
            barcode: "some barcode",
            farm_id: 42,
            floor_id: 42,
            name: "some name",
            polygon: "some polygon"
          },
          default_key: :barcode,
          update: %{
            barcode: "some updated barcode",
            farm_id: 43,
            floor_id: 43,
            name: "some updated name",
            polygon: "some updated polygon"
          }
        },
        plural: "location_maps",
        repo: Lha.Repo,
        route_helper: "location_map",
        sample_id: -1,
        singular: "location_map",
        string_attr: :barcode,
        table: "location_maps",
        types: %{
          barcode: :string,
          farm_id: :integer,
          floor_id: :integer,
          name: :string,
          polygon: :binary
        },
        uniques: [],
        web_namespace: nil,
        web_path: nil
      },
      test_file: "test/lha/settings/settings_test.exs",
      web_module: LhaWeb
    }

<h2>Listing <%= schema.human_plural %></h2>

<table class="table">
  <thead>
    <tr>
<%= for {k, _} <- schema.attrs do %>      <th><%= Phoenix.Naming.humanize(Atom.to_string(k)) %></th>
<% end %>
      <th></th>
    </tr>
  </thead>
  <tbody>
<%%= for <%= schema.singular %> <- @<%= schema.plural %> do %>
    <tr>
<%= for {k, _} <- schema.attrs do %>      <td><%%= <%= schema.singular %>.<%= k %> %></td>
<% end %>
      <td class="text-right">
        <span><%%= link "Show", to: <%= schema.route_helper %>_path(@conn, :show, <%= schema.singular %>), class: "btn btn-default btn-xs" %></span>
        <span><%%= link "Edit", to: <%= schema.route_helper %>_path(@conn, :edit, <%= schema.singular %>), class: "btn btn-default btn-xs" %></span>
        <span><%%= link "Delete", to: <%= schema.route_helper %>_path(@conn, :delete, <%= schema.singular %>), method: :delete, data: [confirm: "Are you sure?"], class: "btn btn-danger btn-xs" %></span>
      </td>
    </tr>
<%% end %>
  </tbody>
</table>

<span><%%= link "New <%= schema.human_singular %>", to: <%= schema.route_helper %>_path(@conn, :new) %></span>

<script type="text/javascript">
    <%= schema.singular %>Source = new dataSource("<%= schema.table %>", {}, [], [
    <%= for {k, _} <- schema.attrs do %>{"label": "<%= Phoenix.Naming.humanize(Atom.to_string(k)) %>" , "data": "<%= k %>"},
    <% end %>
    {"label": "Action", "data": "id"}

    ], "#myTable1");

    <%= schema.singular %>Source.buttons = [{
      iconName: "create", color: "warning", onClickFunction: editData, fnParams: { selector: "#myTable1", link:  "<%= schema.table %>", customCols: null,  module: "<%= inspect context.schema.alias %>"}
    }]
    <%= schema.singular %>Source.table = populateTable(<%= schema.singular %>Source)
    dataSources["<%= schema.table %>"] = <%= schema.singular %>Source

</script>