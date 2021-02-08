defmodule Mix.Tasks.Phx.Gen.Theme do
  use Mix.Task

  @start_apps [
    :porcelain
  ]

  @shortdoc "Import Tim's Creative's Material Dashboard Pro & Damien's phoenix_form.js"

  @moduledoc """

  """

  @doc false
  def run(args) do
    # Application.put_env(:phoenix, :serve_endpoints, true, persistent: true)
    # Mix.Tasks.Run.run(run_args() ++ args)

    run_args()
  end

  def material_frontend(app_dir, project) do
    material_kit_assets = "#{app_dir}/priv/static/frontend/assets"
    File.cp_r(material_kit_assets, File.cwd!() <> "/priv/static/frontend")

    # frontend controller 
    Mix.Generator.create_file(
      File.cwd!() <> "/lib//#{project.alias_name}_web/controllers/landing_page_controller.ex",
      EEx.eval_file("#{app_dir}/priv/templates/phx.gen.theme/landing_page_controller.ex",
        project: project
      )
    )

    # frontend view
    material_loginview_ex =
      File.cwd!() <> "/lib/#{project.alias_name}_web/views" <> "/landing_page_view.ex"

    Mix.Generator.create_file(
      material_loginview_ex,
      EEx.eval_file("#{app_dir}/priv/templates/phx.gen.theme/landing_page_view.ex",
        project: project
      )
    )

    # frontend layout

    material_frontend_ex =
      File.cwd!() <> "/lib/#{project.alias_name}_web/templates/layout" <> "/frontend.html.eex"

    Mix.Generator.create_file(
      material_frontend_ex,
      EEx.eval_file("#{app_dir}/priv/templates/layout/material_frontend.html.eex",
        project: project
      )
    )

    # login template
    material_login_html_ex =
      File.cwd!() <> "/lib/#{project.alias_name}_web/templates/landing_page" <> "/index.html.eex"

    Mix.Generator.create_file(
      material_login_html_ex,
      EEx.eval_file("#{app_dir}/priv/templates/phx.gen.theme/landing_index.html.eex",
        project: project
      )
    )
  end

  def material_dashboard(app_dir, project) do
    material_dashboard_assets = "#{app_dir}/priv/static/assets"
    File.cp_r(material_dashboard_assets, File.cwd!() <> "/priv/static")

    material_app_ex =
      File.cwd!() <> "/lib/#{project.alias_name}_web/templates/layout" <> "/app.html.eex"

    Mix.Generator.create_file(
      material_app_ex,
      EEx.eval_file("#{app_dir}/priv/templates/layout/material_app.html.eex", project: project)
    )
  end

  def material_login(app_dir, project) do
    # login controller 
    Mix.Generator.create_file(
      File.cwd!() <> "/lib//#{project.alias_name}_web/controllers/login_controller.ex",
      EEx.eval_file("#{app_dir}/priv/templates/phx.gen.theme/login_controller.ex",
        project: project
      )
    )

    # login view
    material_loginview_ex =
      File.cwd!() <> "/lib/#{project.alias_name}_web/views" <> "/login_view.ex"

    Mix.Generator.create_file(
      material_loginview_ex,
      EEx.eval_file("#{app_dir}/priv/templates/phx.gen.theme/login_view.ex", project: project)
    )

    # login template
    material_login_html_ex =
      File.cwd!() <> "/lib/#{project.alias_name}_web/templates/login" <> "/login.html.eex"

    Mix.Generator.create_file(
      material_login_html_ex,
      EEx.eval_file("#{app_dir}/priv/templates/phx.gen.theme/login.html.eex", project: project)
    )

    # login layout with form inside
    material_login_ex =
      File.cwd!() <> "/lib/#{project.alias_name}_web/templates/layout" <> "/login.html.eex"

    Mix.Generator.create_file(
      material_login_ex,
      EEx.eval_file("#{app_dir}/priv/templates/layout/material_login.html.eex", project: project)
    )
  end

  defp run_args() do
    Enum.each(@start_apps, &Application.ensure_all_started/1)
    IO.puts("importing Material Dashboard")

    server = Application.get_env(:red_potion, :server)
    project = Application.get_env(:red_potion, :project)
    app_dir = Application.app_dir(:phoenix)

    material_frontend(app_dir, project)
    material_dashboard(app_dir, project)
    material_login(app_dir, project)

    utility_ex = File.cwd!() <> "/lib//utility.ex"

    Mix.Generator.create_file(
      utility_ex,
      EEx.eval_file("#{app_dir}/priv/templates/phx.gen.theme/utility.ex", project: project)
    )

    Mix.Generator.create_file(
      File.cwd!() <> "/lib//#{project.alias_name}_web/controllers/api_controller.ex",
      EEx.eval_file("#{app_dir}/priv/templates/phx.gen.theme/api_controller.ex", project: project)
    )

    authorization_ex = File.cwd!() <> "/lib/#{project.alias_name}/authorization.ex"

    Mix.Generator.create_file(
      authorization_ex,
      EEx.eval_file("#{app_dir}/priv/templates/phx.gen.theme/authorization.ex", project: project)
    )

    ~s(\r\n\r\nPlease put the following plug to your browser pipeline.\r\n\r\n\t   plug\(#{
      project.name
    }.Authorization\)\r\n)
    |> IO.puts()

    ~s(\r\n\r\nPlease put the following routes to your router.ex\r\n\r\n\tscope \"/admin\", #{
      project.name
    }Web do\r\n\t  pipe_through \:browser\r\n\t  get\(\"/login\", LoginController, :index\)\r\n\t  post\(\"/authenticate\", LoginController, :authenticate\)\r\n\t  get\(\"/logout\", LoginController, :logout\)\r\n\tend\r\n)
    |> IO.puts()

    ~s(\r\n\tscope \"/\", #{project.name}Web do\r\n\t  pipe_through \:browser\r\n\t  get\(\"/\", LandingPageController, :index\)\r\n\tend\r\n\r\n)
    |> IO.puts()

    ~s(\r\n\tscope \"/api\", #{project.name}Web do\r\n\t  pipe_through \:api\r\n\t  get\(\"/webhook\", ApiController, :webhook\)\r\n\t  post\(\"/webhook\", ApiController, :webhook_post\)\r\n\t  delete\(\"/webhook\", ApiController, :webhook_delete\)\r\n\tend\r\n\r\n)
    |> IO.puts()

    []
  end
end
